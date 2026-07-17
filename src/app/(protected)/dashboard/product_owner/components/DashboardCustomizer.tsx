"use client";

import { X, Check, Star, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";

export interface WidgetConfig {
  id: string;
  name: string;
  visible: boolean;
  favorite: boolean;
}

interface DashboardCustomizerProps {
  widgets: WidgetConfig[];
  onChange: (widgets: WidgetConfig[]) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function DashboardCustomizer({
  widgets,
  onChange,
  onClose,
  onReset,
}: DashboardCustomizerProps) {
  function toggleVisible(id: string) {
    const next = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    onChange(next);
  }

  function toggleFavorite(id: string) {
    const next = widgets.map((w) => (w.id === id ? { ...w, favorite: !w.favorite } : w));
    onChange(next);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= widgets.length) return;
    const copy = [...widgets];
    const temp = copy[idx]!;
    copy[idx] = copy[nextIdx]!;
    copy[nextIdx] = temp;
    onChange(copy);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bb-glass w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h3 className="bb-display text-lg font-semibold text-ink">Customize Workspace Dashboard</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-ink cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
          {widgets.map((widget, i) => (
            <div
              key={widget.id}
              className="flex items-center justify-between rounded-xl bg-[var(--surface-strong)] p-3.5 transition hover:bg-[var(--surface-strong)] border border-[var(--border)]"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFavorite(widget.id)}
                  className={`cursor-pointer ${widget.favorite ? "text-amber-400" : "text-ink-faint hover:text-ink-soft"}`}
                >
                  <Star size={16} fill={widget.favorite ? "currentColor" : "none"} />
                </button>
                <span className="text-sm font-medium text-ink">{widget.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={i === 0}
                  onClick={() => move(widget.id, -1)}
                  className="rounded bg-[var(--surface-strong)] p-1 text-ink-faint hover:bg-[var(--surface-strong)] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  disabled={i === widgets.length - 1}
                  onClick={() => move(widget.id, 1)}
                  className="rounded bg-[var(--surface-strong)] p-1 text-ink-faint hover:bg-[var(--surface-strong)] disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  onClick={() => toggleVisible(widget.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition ${
                    widget.visible
                      ? "bg-purple-500/20 text-purple"
                      : "bg-[var(--surface-strong)] text-ink-faint hover:bg-[var(--surface-strong)]"
                  }`}
                >
                  {widget.visible ? (
                    <>
                      <Eye size={12} /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} /> Hidden
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] px-6 py-4 bg-[var(--bg)]/10">
          <button
            onClick={onReset}
            className="text-xs font-medium text-ink-faint hover:text-ink-soft cursor-pointer"
          >
            Restore Defaults
          </button>
          <button
            onClick={onClose}
            className="bb-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer"
          >
            <Check size={14} /> Save Layout
          </button>
        </div>
      </div>
    </div>
  );
}
