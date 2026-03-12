import type { Solution, Tag, User, SyncLog, SolutionStatus, SolutionType, Role, Attachment, Tool } from "@prisma/client";

export type { Solution, Tag, User, SyncLog, SolutionStatus, SolutionType, Role, Attachment, Tool };

export type SolutionWithTags = Solution & {
  tags: Tag[];
  owner?: User | null;
  attachments?: Attachment[];
  tools?: Tool[];
};

export type SolutionsResponse = {
  solutions: SolutionWithTags[];
  total: number;
  page: number;
  totalPages: number;
};

export type SolutionFilters = {
  type?: SolutionType[];
  department?: string[];
  status?: SolutionStatus[];
  tags?: string[];
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type DashboardStats = {
  totalSolutions: number;
  totalMau: number;
  newThisMonth: number;
  departments: number;
};
