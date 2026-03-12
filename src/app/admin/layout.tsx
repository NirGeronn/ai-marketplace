import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-48 shrink-0">
          <nav className="space-y-1">
            <h3 className="font-semibold text-sm text-slate-900 mb-3">Admin</h3>
            <Link
              href="/admin"
              className="block text-sm text-slate-500 hover:text-slate-900 py-1.5"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/sync"
              className="block text-sm text-slate-500 hover:text-slate-900 py-1.5"
            >
              Jira Sync
            </Link>
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
