import { findSolutionsWithRelations } from "@/lib/queries";
import type { SolutionWithTags } from "@/types";

export async function searchSolutions(query: string): Promise<SolutionWithTags[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (terms.length === 0) return [];

  // Build OR conditions for each term across name, description, department, tags
  const solutions = await findSolutionsWithRelations({
    where: {
      OR: terms.flatMap((term) => [
        { name: { contains: term, mode: "insensitive" as const } },
        { description: { contains: term, mode: "insensitive" as const } },
        { department: { contains: term, mode: "insensitive" as const } },
        { tags: { some: { name: { contains: term, mode: "insensitive" as const } } } },
      ]),
    },
    orderBy: { mau: "desc" },
    take: 20,
  });

  // Score results by how many terms match
  const scored = solutions.map((solution) => {
    let score = 0;
    const text = `${solution.name} ${solution.description} ${solution.department} ${solution.tags.map((t) => t.name).join(" ")}`.toLowerCase();

    for (const term of terms) {
      if (solution.name.toLowerCase().includes(term)) score += 3;
      if (solution.department.toLowerCase().includes(term)) score += 2;
      if (solution.tags.some((t) => t.name.toLowerCase().includes(term))) score += 2;
      if (solution.description.toLowerCase().includes(term)) score += 1;
    }

    // Boost by popularity
    score += Math.log10(Math.max(solution.mau, 1)) * 0.5;

    return { solution, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.solution);
}
