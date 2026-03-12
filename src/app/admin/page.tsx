import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Sequential queries to avoid PrismaPg adapter concurrency bug
  const totalSolutions = await prisma.solution.count();
  const byStatus = await prisma.solution.groupBy({ by: ["status"], _count: { status: true } });
  const byType = await prisma.solution.groupBy({ by: ["solutionType"], _count: { solutionType: true } });
  const lastSync = await prisma.syncLog.findFirst({ orderBy: { startedAt: "desc" } });

  const typeBgs: Record<string, string> = {
    AGENT: "bg-indigo-50 text-indigo-600",
    COPILOT: "bg-purple-50 text-purple-600",
    AUTOMATION: "bg-amber-50 text-amber-600",
    ANALYTICS: "bg-emerald-50 text-emerald-600",
  };

  const typeIcons: Record<string, string> = {
    AGENT: "smart_toy",
    COPILOT: "assistant",
    AUTOMATION: "bolt",
    ANALYTICS: "analytics",
  };

  return (
    <div>
      <div className="border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-xl">admin_panel_settings</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">Manage solutions and integrations</p>
              </div>
            </div>
            <Link href="/admin/sync">
              <Button className="bg-slate-900 text-white hover:bg-slate-800 font-semibold">
                <span className="material-symbols-outlined text-[18px] mr-2">sync</span>
                Jira Sync
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-static p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">inventory_2</span>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total Solutions</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalSolutions}</p>
          </div>

          <div className="card-static p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">sync</span>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Last Sync</p>
            </div>
            {lastSync ? (
              <>
                <p className="text-lg font-bold capitalize text-slate-900">{lastSync.status}</p>
                <p className="text-xs text-slate-500">
                  {new Date(lastSync.startedAt).toLocaleString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No syncs yet</p>
            )}
          </div>

          <div className="card-static p-5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">check_circle</span>
              <p className="text-xs text-slate-400 uppercase tracking-wider">By Status</p>
            </div>
            <div className="space-y-1.5">
              {byStatus.map((s) => (
                <div key={s.status} className="flex justify-between text-sm">
                  <span className="text-slate-500">{s.status}</span>
                  <span className="font-semibold text-slate-900">{s._count.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[20px] text-purple-600">category</span>
            <h2 className="font-semibold text-slate-900">By Solution Type</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {byType.map((t) => {
              const bg = typeBgs[t.solutionType] || "bg-slate-50 text-slate-600";
              const [bgClass, textClass] = bg.split(" ");
              return (
                <div key={t.solutionType} className="card-static p-4 text-center">
                  <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center mx-auto mb-3`}>
                    <span className={`material-symbols-outlined ${textClass} text-2xl`}>{typeIcons[t.solutionType] || "lightbulb"}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{t._count.solutionType}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.solutionType}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
