import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { fetchJiraIssues, mapJiraIssueToSolution } from "@/lib/jira";
import { startOperation, isAborted } from "@/lib/sync-lock";

export async function POST() {
  if (!process.env.JIRA_BASE_URL || !process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
    return NextResponse.json(
      { error: "Jira not configured. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN." },
      { status: 400 }
    );
  }

  // Abort any previous sync/seed and get our signal
  const signal = startOperation();

  let triggeredBy = "system";
  try {
    const session = await auth();
    if (session?.user?.email) triggeredBy = session.user.email;
  } catch {
    // auth not configured
  }

  let synced = 0;
  let errored = 0;
  const errors: string[] = [];

  try {
    // Clear all data — truncate cascade handles FK constraints
    await prisma.$queryRaw`TRUNCATE TABLE "_SolutionToTag", solutions, tags, sync_logs CASCADE`;

    // Check if we were aborted (user switched back to mock)
    if (isAborted(signal)) {
      return NextResponse.json({ status: "aborted", synced: 0 });
    }

    let nextPageToken: string | undefined;

    do {
      // Check abort before each page fetch
      if (isAborted(signal)) {
        return NextResponse.json({ status: "aborted", synced });
      }

      const response = await fetchJiraIssues(undefined, nextPageToken);

      for (const issue of response.issues) {
        // Check abort before each issue insert
        if (isAborted(signal)) {
          return NextResponse.json({ status: "aborted", synced });
        }

        try {
          const mapped = mapJiraIssueToSolution(issue);
          const { tags: tagNames, ...solutionData } = mapped;

          await prisma.solution.upsert({
            where: { jiraTicketId: mapped.jiraTicketId! },
            create: {
              ...solutionData,
              tags: {
                connectOrCreate: tagNames.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              },
            },
            update: {
              ...solutionData,
              tags: {
                set: [],
                connectOrCreate: tagNames.map((name) => ({
                  where: { name },
                  create: { name },
                })),
              },
            },
          });

          synced++;
        } catch (err) {
          errored++;
          errors.push(`${issue.key}: ${(err as Error).message}`);
        }
      }

      nextPageToken = response.nextPageToken ?? undefined;
    } while (nextPageToken);

    // Final abort check before logging
    if (isAborted(signal)) {
      return NextResponse.json({ status: "aborted", synced });
    }

    // Log the sync result
    await prisma.syncLog.create({
      data: {
        source: "jira",
        status: errored > 0 ? "partial" : "success",
        message: errors.length > 0 ? errors.join("\n") : null,
        issuesSynced: synced,
        issuesErrored: errored,
        triggeredBy,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ status: "success", synced, errored, errors });
  } catch (error) {
    // If aborted, don't log — the DB was likely truncated by the new operation
    if (isAborted(signal)) {
      return NextResponse.json({ status: "aborted", synced });
    }

    // Log failure if possible
    try {
      await prisma.syncLog.create({
        data: {
          source: "jira",
          status: "error",
          message: (error as Error).message,
          issuesSynced: synced,
          issuesErrored: errored,
          triggeredBy,
          completedAt: new Date(),
        },
      });
    } catch {
      // DB might be in a bad state, just return the error
    }

    return NextResponse.json(
      { error: "Sync failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
