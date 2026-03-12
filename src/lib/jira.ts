import type { JiraIssue, JiraSearchResponse } from "@/types/jira";
import { JIRA_STATUS_MAP } from "@/lib/constants";
import type { SolutionStatus, SolutionType } from "@prisma/client";

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || "AI";

// Custom Jira field IDs (e.g., "customfield_10001")
// Set these env vars to map custom Jira fields to solution properties.
// When not set, values are inferred from labels/summary.
const JIRA_FIELD_GOAL = process.env.JIRA_FIELD_GOAL;
const JIRA_FIELD_TYPE = process.env.JIRA_FIELD_TYPE;
const JIRA_FIELD_MAU = process.env.JIRA_FIELD_MAU;
const JIRA_FIELD_DEPARTMENT = process.env.JIRA_FIELD_DEPARTMENT;

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
}

export async function fetchJiraIssues(
  jql?: string,
  nextPageToken?: string
): Promise<JiraSearchResponse> {
  const query = jql || `project = "${JIRA_PROJECT_KEY}" ORDER BY created DESC`;

  const fields = [
    "summary",
    "description",
    "status",
    "assignee",
    "labels",
    "created",
    "updated",
    // Include custom fields if configured
    ...(JIRA_FIELD_GOAL ? [JIRA_FIELD_GOAL] : []),
    ...(JIRA_FIELD_TYPE ? [JIRA_FIELD_TYPE] : []),
    ...(JIRA_FIELD_MAU ? [JIRA_FIELD_MAU] : []),
    ...(JIRA_FIELD_DEPARTMENT ? [JIRA_FIELD_DEPARTMENT] : []),
  ];

  const response = await fetch(`${JIRA_BASE_URL}/rest/api/3/search/jql`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jql: query,
      fields,
      maxResults: 50,
      ...(nextPageToken ? { nextPageToken } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jira API error (${response.status}): ${error}`);
  }

  return response.json();
}

function extractPlainText(description: unknown): string {
  if (!description) return "";
  if (typeof description === "string") return description;

  // Atlassian Document Format (ADF) - extract text recursively
  const doc = description as { content?: Array<{ content?: Array<{ text?: string; content?: unknown[] }> }> };
  if (!doc.content) return "";

  function extractText(nodes: unknown[]): string {
    return nodes
      .map((node) => {
        const n = node as { text?: string; content?: unknown[] };
        if (n.text) return n.text;
        if (n.content) return extractText(n.content);
        return "";
      })
      .join(" ");
  }

  return extractText(doc.content).trim();
}

function extractCustomFieldValue(fields: Record<string, unknown>, fieldId: string): string | null {
  const value = fields[fieldId];
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  // Jira select fields return { value: "..." } or { name: "..." }
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.value === "string") return obj.value;
    if (typeof obj.name === "string") return obj.name;
  }
  return null;
}

const VALID_SOLUTION_TYPES: SolutionType[] = ["AGENT", "COPILOT", "AUTOMATION", "ANALYTICS"];

function inferSolutionType(labels: string[], summary: string): SolutionType {
  const text = [...labels, summary].join(" ").toLowerCase();
  if (text.includes("agent")) return "AGENT";
  if (text.includes("copilot")) return "COPILOT";
  if (text.includes("automation") || text.includes("workflow")) return "AUTOMATION";
  if (text.includes("analytics") || text.includes("dashboard") || text.includes("report")) return "ANALYTICS";
  return "AGENT";
}

const DEPARTMENT_LABELS: Record<string, string> = {
  product: "Product",
  engineering: "Engineering",
  marketing: "Marketing",
  cs: "Customer Success",
  "customer-success": "Customer Success",
  data: "Data Engineering",
  security: "Security",
  finance: "Finance",
  hr: "HR",
  legal: "Legal",
  sales: "Sales",
  operations: "Operations",
};

function inferDepartment(labels: string[]): string {
  for (const label of labels) {
    const normalized = label.toLowerCase();
    if (DEPARTMENT_LABELS[normalized]) return DEPARTMENT_LABELS[normalized];
  }
  return "AI";
}

export function mapJiraIssueToSolution(issue: JiraIssue) {
  const { fields } = issue;
  const statusName = fields.status.name;
  const mappedStatus = (JIRA_STATUS_MAP[statusName] || "EXPERIMENTAL") as SolutionStatus;

  // Use custom fields when configured, fall back to label-based inference
  const goalFromField = JIRA_FIELD_GOAL
    ? extractCustomFieldValue(fields as Record<string, unknown>, JIRA_FIELD_GOAL)
    : null;

  const typeFromField = JIRA_FIELD_TYPE
    ? extractCustomFieldValue(fields as Record<string, unknown>, JIRA_FIELD_TYPE)
    : null;
  const solutionType: SolutionType =
    typeFromField && VALID_SOLUTION_TYPES.includes(typeFromField.toUpperCase() as SolutionType)
      ? (typeFromField.toUpperCase() as SolutionType)
      : inferSolutionType(fields.labels, fields.summary);

  const deptFromField = JIRA_FIELD_DEPARTMENT
    ? extractCustomFieldValue(fields as Record<string, unknown>, JIRA_FIELD_DEPARTMENT)
    : null;
  const department = deptFromField || inferDepartment(fields.labels);

  const mauFromField = JIRA_FIELD_MAU
    ? extractCustomFieldValue(fields as Record<string, unknown>, JIRA_FIELD_MAU)
    : null;
  const mau = mauFromField ? parseInt(mauFromField, 10) || 0 : 0;

  return {
    name: fields.summary,
    description: extractPlainText(fields.description),
    goal: goalFromField,
    department,
    status: mappedStatus,
    solutionType,
    mau,
    jiraTicketId: issue.key,
    jiraTicketUrl: `${JIRA_BASE_URL}/browse/${issue.key}`,
    jiraLastSynced: new Date(),
    ownerName: fields.assignee?.displayName || null,
    ownerEmail: fields.assignee?.emailAddress || null,
    tags: fields.labels.filter(
      (l) => !Object.keys(DEPARTMENT_LABELS).includes(l.toLowerCase())
    ),
  };
}

export type MappedSolution = ReturnType<typeof mapJiraIssueToSolution>;

export async function syncAllFromJira() {
  const results: {
    synced: number;
    errored: number;
    errors: string[];
    issues: MappedSolution[];
  } = { synced: 0, errored: 0, errors: [], issues: [] };

  let nextPageToken: string | undefined;

  do {
    const response = await fetchJiraIssues(undefined, nextPageToken);

    for (const issue of response.issues) {
      try {
        const mapped = mapJiraIssueToSolution(issue);
        results.synced++;
        results.issues.push(mapped);
      } catch (err) {
        results.errored++;
        results.errors.push(`${issue.key}: ${(err as Error).message}`);
      }
    }

    nextPageToken = response.nextPageToken ?? undefined;
  } while (nextPageToken);

  return results;
}
