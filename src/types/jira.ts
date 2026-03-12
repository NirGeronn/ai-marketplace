export type JiraUser = {
  accountId: string;
  displayName: string;
  emailAddress?: string;
};

export type JiraIssue = {
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: unknown;
    status: { name: string };
    assignee?: JiraUser | null;
    labels: string[];
    created: string;
    updated: string;
    [key: string]: unknown;
  };
};

export type JiraSearchResponse = {
  issues: JiraIssue[];
  total: number;
  nextPageToken?: string | null;
};
