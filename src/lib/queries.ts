import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Workaround for Prisma driver adapter bug where `include: { tags: true, owner: true }`
 * causes a 10s delay per query. We split into two queries and merge the results.
 */
export async function findSolutionsWithRelations(args: {
  where?: Prisma.SolutionWhereInput;
  orderBy?: Prisma.SolutionOrderByWithRelationInput;
  skip?: number;
  take?: number;
}) {
  const solutions = await prisma.solution.findMany({
    ...args,
    include: { tags: true },
  });

  const ownerIds = [...new Set(solutions.map(s => s.ownerId).filter(Boolean))] as string[];
  if (ownerIds.length === 0) {
    return solutions.map(s => ({ ...s, owner: null }));
  }

  const owners = await prisma.user.findMany({
    where: { id: { in: ownerIds } },
  });
  const ownerMap = new Map(owners.map(o => [o.id, o]));

  return solutions.map(s => ({
    ...s,
    owner: s.ownerId ? ownerMap.get(s.ownerId) ?? null : null,
  }));
}

export async function findSolutionByIdWithRelations(id: string) {
  const solution = await prisma.solution.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!solution) return null;

  let owner = null;
  if (solution.ownerId) {
    owner = await prisma.user.findUnique({ where: { id: solution.ownerId } });
  }

  const attachments = await prisma.attachment.findMany({
    where: { solutionId: id },
  });

  const tools = await prisma.tool.findMany({
    where: { solutionId: id },
  });

  return { ...solution, owner, attachments, tools };
}
