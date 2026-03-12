import Link from "next/link";

type SolutionReference = {
  id: string;
  name: string;
};

export function SolutionPills({ solutions }: { solutions: SolutionReference[] }) {
  return (
    <div className="mt-4 pt-3 border-t border-slate-200">
      <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">
        Recommended Solutions
      </p>
      <div className="flex flex-wrap gap-2">
        {solutions.map((solution) => (
          <Link key={solution.id} href={`/solutions/${solution.id}`}>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              {solution.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
