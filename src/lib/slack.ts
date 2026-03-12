type SlackEvent =
  | { type: "solution_created"; name: string; department: string; owner: string; url: string }
  | { type: "solution_updated"; name: string; field: string; oldValue: string; newValue: string; url: string }
  | { type: "sync_completed"; synced: number; errored: number };

function formatSlackMessage(event: SlackEvent) {
  switch (event.type) {
    case "solution_created":
      return {
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "New AI Solution Added" },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Solution:*\n${event.name}` },
              { type: "mrkdwn", text: `*Department:*\n${event.department}` },
              { type: "mrkdwn", text: `*Owner:*\n${event.owner}` },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View in Marketplace" },
                url: event.url,
              },
            ],
          },
        ],
      };

    case "solution_updated":
      return {
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "AI Solution Updated" },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Solution:*\n${event.name}` },
              { type: "mrkdwn", text: `*Changed:*\n${event.field}: ${event.oldValue} -> ${event.newValue}` },
            ],
          },
        ],
      };

    case "sync_completed":
      return {
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "Jira Sync Completed" },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Synced *${event.synced}* solutions${event.errored > 0 ? ` with *${event.errored}* errors` : " successfully"}.`,
            },
          },
        ],
      };
  }
}

export async function notifySlack(event: SlackEvent): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const message = formatSlackMessage(event);
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error("Slack notification failed:", error);
  }
}
