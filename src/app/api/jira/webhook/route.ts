import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapJiraIssueToSolution } from "@/lib/jira";
import { notifySlack } from "@/lib/slack";
import type { JiraIssue } from "@/types/jira";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Jira webhook sends the issue in different formats depending on the event
  const event = body.webhookEvent;
  const issue = body.issue as JiraIssue | undefined;

  if (!issue) {
    return NextResponse.json({ error: "No issue in payload" }, { status: 400 });
  }

  // Only process issue created/updated events
  if (!event?.includes("issue")) {
    return NextResponse.json({ status: "ignored" });
  }

  try {
    const mapped = mapJiraIssueToSolution(issue);
    const { tags: tagNames, ...solutionData } = mapped;

    const existing = await prisma.solution.findUnique({
      where: { jiraTicketId: mapped.jiraTicketId! },
    });

    const solution = await prisma.solution.upsert({
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

    if (!existing) {
      await notifySlack({
        type: "solution_created",
        name: solution.name,
        department: solution.department,
        owner: solution.ownerName || "Unknown",
        url: `${process.env.AUTH_URL}/solutions/${solution.id}`,
      });
    }

    return NextResponse.json({ status: "synced", id: solution.id });
  } catch (error) {
    console.error("Webhook sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
