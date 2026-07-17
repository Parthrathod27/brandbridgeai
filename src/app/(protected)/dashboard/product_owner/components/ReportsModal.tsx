"use client";

import { X, FileText, Download, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { PO_API_BASE } from "../lib/types";

interface ReportsModalProps {
  onClose: () => void;
}

export default function ReportsModal({ onClose }: ReportsModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [reportType, setReportType] = useState("revenue");
  const [format, setFormat] = useState("csv");

  const reports = [
    { id: "revenue", name: "Revenue Performance Report" },
    { id: "campaign", name: "Campaign Activity Report" },
    { id: "product", name: "Product Metrics Report" },
    { id: "collaboration", name: "Collaboration History Report" },
  ];

  async function triggerDownload() {
    setDownloading(reportType);
    try {
      let csvContent = "";
      if (reportType === "revenue") {
        const res = await fetch(`${PO_API_BASE}/products`);
        const data = await res.json();
        const products = data.products ?? [];
        csvContent = "Product Name,Category,Views,Collaboration Requests,Marketing Budget,Status\n";
        for (const p of products) {
          csvContent += `"${p.name || ""}","${p.category || ""}",${p.analytics?.views ?? 0},${p.analytics?.collaborationRequests ?? 0},${p.marketingBudget ?? 0},"${p.status || "draft"}"\n`;
        }
      } else if (reportType === "campaign") {
        const res = await fetch("/api/campaigns");
        const data = await res.json();
        const campaigns = data.campaigns ?? [];
        csvContent = "Campaign Title,Budget,Status,Participants Count,Created Date\n";
        for (const c of campaigns) {
          csvContent += `"${c.title || ""}",${c.budget ?? 0},"${c.status || "draft"}",${c.participants?.length ?? 0},"${new Date(c.createdAt).toLocaleDateString()}"\n`;
        }
      } else if (reportType === "collaboration") {
        const res = await fetch(`${PO_API_BASE}/collaborations`);
        const data = await res.json();
        const collabs = data.collaborations ?? [];
        csvContent = "Brand Partner,Product,Status,Message,Compatibility Score,Created Date\n";
        for (const c of collabs) {
          const partner = c.partnerId?.name || "Brand Partner";
          const product = c.productId?.name || "N/A";
          const escapedMsg = (c.message || "").replace(/"/g, '""');
          csvContent += `"${partner}","${product}","${c.status || "pending"}","${escapedMsg}",${c.compatibilityScore ?? "N/A"},"${new Date(c.createdAt).toLocaleDateString()}"\n`;
        }
      } else {
        const res = await fetch(`${PO_API_BASE}/products`);
        const data = await res.json();
        const products = data.products ?? [];
        csvContent = "Product Name,Category,Views,Collaboration Requests,Status\n";
        for (const p of products) {
          csvContent += `"${p.name || ""}","${p.category || ""}",${p.analytics?.views ?? 0},${p.analytics?.collaborationRequests ?? 0},"${p.status || "draft"}"\n`;
        }
      }

      const blob = new Blob([csvContent], { type: format === "csv" ? "text/csv" : "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to generate dynamic reports CSV", e);
      alert("Failed to export report with real database data.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bb-glass w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h3 className="bb-display text-base font-semibold text-ink">Export & Download Reports</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-ink cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-ink-faint">Select Report Type</label>
            <select
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reports.map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {rep.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-ink-faint">Select Format</label>
            <div className="grid grid-cols-3 gap-3">
              {["csv", "excel", "pdf"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-xl py-2.5 text-xs font-semibold uppercase cursor-pointer transition ${
                    format === f
                      ? "bg-purple-500/20 text-purple border border-purple-500/35"
                      : "bg-[var(--surface-strong)] text-ink-faint hover:bg-[var(--surface-strong)] border border-[var(--border)]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 flex gap-2.5 text-xs text-purple">
            <AlertCircle size={16} className="shrink-0 text-purple" />
            <p>Export contains up-to-date data synced from active campaigns, collaborations, and product details.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--border)] px-6 py-4 bg-[var(--bg)]/10">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-ink-faint hover:text-ink cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={triggerDownload}
            disabled={downloading != null}
            className="bb-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-40"
          >
            {downloading ? (
              <>Generating...</>
            ) : (
              <>
                <Download size={14} /> Export Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
