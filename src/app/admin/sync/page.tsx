"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type SyncLog = {
  id: string;
  source: string;
  status: string;
  message: string | null;
  issuesSynced: number;
  issuesErrored: number;
  triggeredBy: string | null;
  startedAt: string;
  completedAt: string | null;
};

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ synced: number; errored: number; errors: string[] } | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    fetch("/api/admin/sync-logs")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []))
      .catch(() => {});
  }, [result]);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/jira/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult({ synced: 0, errored: 1, errors: [data.message || data.error] });
      } else {
        setResult(data);
      }
    } catch (err) {
      setResult({ synced: 0, errored: 1, errors: [(err as Error).message] });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-xl">sync</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jira Sync</h1>
              <p className="text-sm text-slate-500">
                Pull latest AI solution tickets from Jira and update the marketplace
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px] text-blue-600">bolt</span>
            <h2 className="font-semibold text-slate-900">Manual Sync</h2>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleSync}
              disabled={syncing}
              className="bg-slate-900 text-white hover:bg-slate-800 font-semibold disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] mr-2 ${syncing ? "animate-spin" : ""}`}>
                sync
              </span>
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>

            {result && (
              <div className={`p-4 rounded-xl text-sm border ${
                result.errored > 0
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                <p className="font-medium">
                  Synced {result.synced} solutions{result.errored > 0 ? `, ${result.errored} errors` : ""}.
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-xs opacity-80">{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card-static p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px] text-purple-600">history</span>
            <h2 className="font-semibold text-slate-900">Sync History</h2>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">No sync logs yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${
                        log.status === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : log.status === "error"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(log.startedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {log.issuesSynced} synced, {log.issuesErrored} errors
                      {log.triggeredBy && ` · by ${log.triggeredBy}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
