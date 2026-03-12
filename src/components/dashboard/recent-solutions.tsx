import { SolutionGrid } from "@/components/solutions/solution-grid";
import type { SolutionWithTags } from "@/types";

export function RecentSolutions({ solutions }: { solutions: SolutionWithTags[] }) {
  if (solutions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-purple-600 text-xl">schedule</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recently Added</h2>
          <p className="text-sm text-slate-500">Latest AI solutions added to the marketplace</p>
        </div>
      </div>
      <SolutionGrid solutions={solutions} />
    </section>
  );
}
