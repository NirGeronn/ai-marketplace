import { SolutionCard } from "./solution-card";
import type { SolutionWithTags } from "@/types";

export function SolutionGrid({ solutions }: { solutions: SolutionWithTags[] }) {
  if (solutions.length === 0) {
    return (
      <div className="card-static flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No solutions found</h3>
        <p className="text-sm text-slate-500">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {solutions.map((solution) => (
        <SolutionCard key={solution.id} solution={solution} />
      ))}
    </div>
  );
}
