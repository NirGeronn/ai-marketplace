import type { DashboardStats } from "@/types";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Total Solutions", value: stats.totalSolutions, icon: "inventory_2", bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Total MAU", value: stats.totalMau.toLocaleString(), icon: "group", bg: "bg-purple-50", text: "text-purple-600" },
    { label: "New This Month", value: stats.newThisMonth, icon: "trending_up", bg: "bg-emerald-50", text: "text-emerald-600" },
    { label: "Departments", value: stats.departments, icon: "corporate_fare", bg: "bg-pink-50", text: "text-pink-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="card-static p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg} shrink-0`}>
              <span className={`material-symbols-outlined ${item.text} text-xl`}>{item.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
