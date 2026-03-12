"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDataSource } from "@/components/providers/data-source-provider";

export function Navbar() {
  const { data: session } = useSession();
  const { dataSource, setDataSource, switching, setSwitching } = useDataSource();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const handleToggle = async () => {
    const newSource = dataSource === "mock" ? "jira" : "mock";
    const oldSource = dataSource;
    setDataSource(newSource);
    setSwitching(true);
    try {
      if (newSource === "mock") {
        const res = await fetch("/api/seed", { method: "POST" });
        if (!res.ok) throw new Error("Failed to reset to mock data");
      } else {
        const res = await fetch("/api/jira/sync", { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Jira sync failed");
        }
      }
      window.location.reload();
    } catch (err) {
      setDataSource(oldSource);
      setSwitching(false);
      alert((err as Error).message || "Switch failed");
    }
  };

  return (
    <header className="sticky top-0 z-50 nav-clean">
      <div className="max-w-[1440px] mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/appsflyer-logo.png"
              alt="AppsFlyer"
              width={120}
              height={28}
              className="brightness-0 h-6 w-auto"
              priority
            />
            <span className="text-xs font-medium text-slate-400 border-l border-slate-200 pl-3">
              AI Marketplace
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/browse"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              Marketplace
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${dataSource === "mock" ? "text-slate-900" : "text-slate-400"}`}>
              Mock
            </span>
            <button
              onClick={handleToggle}
              disabled={switching}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                dataSource === "jira" ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  dataSource === "jira" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-xs font-medium ${dataSource === "jira" ? "text-slate-900" : "text-slate-400"}`}>
              Jira
            </span>
            {switching && (
              <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium ml-1">
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                Syncing...
              </span>
            )}
          </div>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full cursor-pointer">
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
                    <p className="text-xs text-slate-500">{session.user.email}</p>
                    {session.user.department && (
                      <p className="text-xs text-slate-500">{session.user.department}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">logout</span>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 font-semibold rounded-lg px-5">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
