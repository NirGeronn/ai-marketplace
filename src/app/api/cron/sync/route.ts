import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchJiraIssues, mapJiraIssueToSolution } from "@/lib/jira";
import { notifySlack } from "@/lib/slack";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const syncLog = await prisma.syncLog.create({
    data: {
      source: "jira",
      status: "running",
      triggeredBy: "cron",
    },
  });

  let synced = 0;
  let errored = 0;
  const errors: string[] = [];
  let nextPageToken: string | undefined;

  try {
    do {
      const response = await fetchJiraIssues(undefined, nextPageToken);

      for (const issue of response.issues) {
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

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: errored > 0 ? "partial" : "success",
        message: errors.length > 0 ? errors.join("\n") : null,
        issuesSynced: synced,
        issuesErrored: errored,
        completedAt: new Date(),
      },
    });

    await notifySlack({
      type: "sync_completed",
      synced,
      errored,
    });

    return NextResponse.json({ status: "success", synced, errored, errors });
  } catch (error) {
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: "error",
        message: (error as Error).message,
        issuesSynced: synced,
        issuesErrored: errored,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: "Sync failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
