import { SolutionGrid } from "@/components/solutions/solution-grid";
import type { SolutionWithTags } from "@/types";

export function DepartmentSection({
  department,
  solutions,
}: {
  department: string | null;
  solutions: SolutionWithTags[];
}) {
  if (solutions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-blue-600 text-xl">
            {department ? "target" : "star"}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {department ? `Solutions for ${department}` : "Popular Solutions"}
          </h2>
          <p className="text-sm text-slate-500">
            {department ? "Relevant to your department" : "Most used across the company"}
          </p>
        </div>
      </div>
      <SolutionGrid solutions={solutions} />
    </section>
  );
}
