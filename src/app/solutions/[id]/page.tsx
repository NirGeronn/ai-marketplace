import Link from "next/link";
import { notFound } from "next/navigation";
import { findSolutionByIdWithRelations } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { SOLUTION_STATUSES, SOLUTION_TYPES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function getStatusStyle(status: string) {
  switch (status) {
    case "APPROVED":
      return "badge-certified";
    case "EXPERIMENTAL":
      return "badge-beta";
    case "DEPRECATED":
      return "bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-3 py-1 rounded-full";
    default:
      return "bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-3 py-1 rounded-full";
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "AGENT": return "smart_toy";
    case "COPILOT": return "assistant";
    case "AUTOMATION": return "bolt";
    case "ANALYTICS": return "analytics";
    default: return "lightbulb";
  }
}

function getTypeBg(type: string) {
  switch (type) {
    case "AGENT": return "bg-indigo-50 text-indigo-600";
    case "COPILOT": return "bg-purple-50 text-purple-600";
    case "AUTOMATION": return "bg-amber-50 text-amber-600";
    case "ANALYTICS": return "bg-emerald-50 text-emerald-600";
    default: return "bg-slate-50 text-slate-600";
  }
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const solution = await findSolutionByIdWithRelations(id);

  if (!solution) {
    notFound();
  }

  const statusInfo = SOLUTION_STATUSES.find((s) => s.value === solution.status);
  const typeInfo = SOLUTION_TYPES.find((t) => t.value === solution.solutionType);
  const typeBg = getTypeBg(solution.solutionType);

  return (
    <div>
      {/* Breadcrumb header */}
      <div className="border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <nav className="text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/browse" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">explore</span>
              Browse
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">{solution.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${typeBg.split(" ")[0]} shrink-0`}>
              <span className={`material-symbols-outlined ${typeBg.split(" ")[1]} text-3xl`}>{getTypeIcon(solution.solutionType)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{solution.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {typeInfo?.label}
                </span>
                <span className={getStatusStyle(solution.status)}>
                  {statusInfo?.label}
                </span>
                {solution.featured && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-static p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[20px] text-blue-600">description</span>
                <h2 className="font-semibold text-slate-900">Description</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {solution.description}
              </p>
            </div>

            {solution.goal && (
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">flag</span>
                  <h2 className="font-semibold text-slate-900">Goal</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {solution.goal}
                </p>
              </div>
            )}

            {solution.requirements.length > 0 && (
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[20px] text-amber-600">checklist</span>
                  <h2 className="font-semibold text-slate-900">Requirements</h2>
                </div>
                <ul className="space-y-2">
                  {solution.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-amber-500">check_circle</span>
                      <span className="text-sm text-slate-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {solution.tags.length > 0 && (
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[20px] text-purple-600">label</span>
                  <h2 className="font-semibold text-slate-900">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {solution.tags.map((tag) => (
                    <Link key={tag.id} href={`/browse?tags=${tag.name}`}>
                      <span className="inline-flex text-sm px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer">
                        {tag.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {solution.tools && solution.tools.length > 0 && (
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[20px] text-blue-600">build</span>
                  <h2 className="font-semibold text-slate-900">Tools & Technologies</h2>
                </div>
                <div className="space-y-3">
                  {solution.tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <span className="material-symbols-outlined text-[18px] text-blue-600 mt-0.5 shrink-0">
                        handyman
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900">{tool.name}</span>
                          {tool.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                              {tool.category}
                            </span>
                          )}
                        </div>
                        {tool.description && (
                          <p className="text-xs text-slate-500 mt-1">{tool.description}</p>
                        )}
                        {tool.url && (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-0.5 mt-1"
                          >
                            {tool.url}
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {solution.attachments && solution.attachments.length > 0 && (
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[20px] text-amber-600">attach_file</span>
                  <h2 className="font-semibold text-slate-900">Attachments</h2>
                </div>
                <div className="space-y-2">
                  {solution.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">
                          insert_drive_file
                        </span>
                        <span className="text-sm text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                          {attachment.filename}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
                        download
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card-static p-6 space-y-5">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Monthly Active Users</p>
                </div>
                <p className="text-3xl font-bold text-slate-900">{solution.mau.toLocaleString()}</p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">corporate_fare</span>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Department</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{solution.department}</p>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Owner</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{solution.ownerName || "Unknown"}</p>
                {solution.ownerEmail && (
                  <p className="text-xs text-slate-500">{solution.ownerEmail}</p>
                )}
              </div>

              {solution.jiraTicketId && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">confirmation_number</span>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Jira Ticket</p>
                  </div>
                  {solution.jiraTicketUrl ? (
                    <a
                      href={solution.jiraTicketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                    >
                      {solution.jiraTicketId}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-900">{solution.jiraTicketId}</p>
                  )}
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Created</p>
                </div>
                <p className="text-sm text-slate-700">{new Date(solution.createdAt).toLocaleDateString()}</p>
              </div>

              {solution.jiraLastSynced && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">sync</span>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Last Synced</p>
                  </div>
                  <p className="text-sm text-slate-700">{new Date(solution.jiraLastSynced).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <Link href="/browse">
              <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[16px] mr-2">arrow_back</span>
                Back to Browse
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
