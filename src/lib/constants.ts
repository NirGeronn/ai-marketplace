export const DEPARTMENTS = [
  "AI",
  "Product",
  "Engineering",
  "Marketing",
  "Customer Success",
  "Data Engineering",
  "Security",
  "Finance",
  "HR",
  "Legal",
  "Sales",
  "Operations",
] as const;

export const SOLUTION_TYPES = [
  { value: "AGENT", label: "Agent" },
  { value: "COPILOT", label: "Copilot" },
  { value: "AUTOMATION", label: "Automation" },
  { value: "ANALYTICS", label: "Analytics" },
] as const;

export const SOLUTION_STATUSES = [
  { value: "EXPERIMENTAL", label: "Experimental", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  { value: "APPROVED", label: "Approved", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  { value: "DEPRECATED", label: "Deprecated", color: "bg-red-50 text-red-600 border border-red-200" },
] as const;

export const JIRA_STATUS_MAP: Record<string, string> = {
  "To Do": "EXPERIMENTAL",
  "In Progress": "EXPERIMENTAL",
  "In Review": "EXPERIMENTAL",
  "Done": "APPROVED",
  "Approved": "APPROVED",
  "Deprecated": "DEPRECATED",
  "Closed": "DEPRECATED",
};

export const SORT_OPTIONS = [
  { value: "mau_desc", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
] as const;
