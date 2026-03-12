import Link from "next/link";
import type { SolutionWithTags } from "@/types";
import { SOLUTION_STATUSES } from "@/lib/constants";

function getTypeIcon(type: string) {
  switch (type) {
    case "AGENT": return "smart_toy";
    case "COPILOT": return "assistant";
    case "AUTOMATION": return "bolt";
    case "ANALYTICS": return "analytics";
    default: return "lightbulb";
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "AGENT": return { bg: "bg-indigo-50", text: "text-indigo-600" };
    case "COPILOT": return { bg: "bg-purple-50", text: "text-purple-600" };
    case "AUTOMATION": return { bg: "bg-amber-50", text: "text-amber-600" };
    case "ANALYTICS": return { bg: "bg-emerald-50", text: "text-emerald-600" };
    default: return { bg: "bg-slate-50", text: "text-slate-600" };
  }
}

export function SolutionCard({ solution }: { solution: SolutionWithTags }) {
  const statusLabel = SOLUTION_STATUSES.find((s) => s.value === solution.status)?.label || solution.status;
  const typeColor = getTypeColor(solution.solutionType);

  return (
    <Link href={`/solutions/${solution.id}`}>
      <article className="tool-card bg-white border border-slate-100 rounded-2xl p-6 h-full flex flex-col justify-between cursor-pointer group">
        <div>
          {/* Icon + Status badge */}
          <div className="flex items-center justify-between mb-6">
            <div className={`w-12 h-12 ${typeColor.bg} rounded-xl flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${typeColor.text} text-2xl`}>
                {getTypeIcon(solution.solutionType)}
              </span>
            </div>
            {solution.status === "APPROVED" && (
              <span className="badge-certified">Certified</span>
            )}
            {solution.status === "EXPERIMENTAL" && (
              <span className="badge-beta">Beta</span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
            {solution.name}
          </h3>

          {/* Description */}
          <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
            {solution.description}
          </p>

          {/* Tags */}
          {solution.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {solution.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <span className="text-xs text-gray-400 font-medium">
            {solution.mau.toLocaleString()} Users
          </span>
          <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
            Learn more
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </span>
        </div>
      </article>
    </Link>
  );
}
