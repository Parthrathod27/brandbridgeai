"use client";

import { useState, useEffect } from "react";
import { Loader2, Monitor, Smartphone, Globe } from "lucide-react";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export default function SecuritySection() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionActionLoading, setSessionActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/settings/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function revokeSession(id: string) {
    setSessionActionLoading(id);
    try {
      const res = await fetch(`/api/settings/sessions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
      }
    } finally {
      setSessionActionLoading(null);
    }
  }

  async function logoutAllOther() {
    setSessionActionLoading("all");
    try {
      const res = await fetch(`/api/settings/sessions?allButCurrent=true`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.isCurrent));
      }
    } finally {
      setSessionActionLoading(null);
    }
  }

  function renderDeviceIcon(device: string) {
    const l = device.toLowerCase();
    if (l.includes("mac") || l.includes("windows") || l.includes("linux")) return <Monitor size={16} />;
    if (l.includes("ios") || l.includes("android")) return <Smartphone size={16} />;
    return <Globe size={16} />;
  }

  return (
    <div className="bb-glass rounded-2xl p-6 space-y-8">
      {/* Active Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="bb-display text-lg font-medium text-white">Active Device Sessions</h2>
          {sessions.length > 1 && (
            <button onClick={logoutAllOther} disabled={sessionActionLoading === "all"} className="text-xs font-medium text-red-400 hover:text-red-300 transition flex items-center gap-1.5">
              {sessionActionLoading === "all" && <Loader2 size={12} className="animate-spin" />}
              Log out all other devices
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-white/50" /></div>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                    {renderDeviceIcon(s.device)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{s.device} &middot; {s.browser}</span>
                      {s.isCurrent && <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Current</span>}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
                      <span>{s.location}</span>
                      <span>&bull;</span>
                      <span>Last active: {new Date(s.lastActive).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button onClick={() => revokeSession(s.id)} disabled={sessionActionLoading === s.id} className="text-xs font-medium text-white/40 hover:text-red-400 p-2 transition">
                    {sessionActionLoading === s.id ? <Loader2 size={14} className="animate-spin" /> : "Log out"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
