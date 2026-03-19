"use client";

import { useState, useEffect } from "react";
import { Download, Copy, Eye, Code2, FileText, ImageIcon, Check, X } from "lucide-react";
import { showToast } from "@/components/Toast";

interface Artifact {
  id: number;
  title: string;
  type: "text" | "code" | "image";
  preview: string;
  size: string;
  created: string;
  color: string;
}

const SEED: Artifact[] = [
  { id: 1, title: "Marketing Email Template", type: "text", preview: "Subject: Exciting news — we've just launched...\n\nHi {{first_name}},\n\nWe're thrilled to share something we've been working on for months...", size: "2.1 KB", created: "Today, 11:42 AM", color: "#C96442" },
  { id: 2, title: "REST API Handler", type: "code", preview: "async function fetchUserData(userId: string) {\n  const res = await fetch(`/api/users/${userId}`);\n  if (!res.ok) throw new Error('Failed');\n  return res.json();\n}", size: "4.7 KB", created: "Yesterday, 3:18 PM", color: "#5B8DEF" },
  { id: 3, title: "Q2 Financial Summary", type: "text", preview: "Revenue grew by 23% YoY reaching $4.2M. EBITDA margins improved to 18% from 14% last quarter...", size: "6.3 KB", created: "Mar 17, 2026", color: "#3EA86A" },
  { id: 4, title: "Landing Page Component", type: "code", preview: "export default function HeroSection() {\n  return (\n    <section className=\"hero\">\n      <h1>Build faster with AI</h1>\n    </section>\n  );\n}", size: "8.9 KB", created: "Mar 15, 2026", color: "#7C5CBF" },
  { id: 5, title: "Brand Palette Guide", type: "image", preview: "#C96442  •  #1A1915  •  #E8E4DC  •  #9B9489  •  #21201C", size: "1.2 KB", created: "Mar 12, 2026", color: "#E06C75" },
  { id: 6, title: "System Prompt Template", type: "text", preview: "You are a helpful assistant specialized in...\n\nYour primary responsibilities are:\n1. Answer questions accurately\n2. Maintain context across the conversation...", size: "3.4 KB", created: "Mar 10, 2026", color: "#D4A96A" },
];

const ICON_MAP: Record<string, React.ElementType> = { text: FileText, code: Code2, image: ImageIcon };
const TYPE_COLOR: Record<string, string> = { text: "#C96442", code: "#5B8DEF", image: "#E06C75" };
const FILTERS = ["All", "Code", "Text", "Image"] as const;
type Filter = typeof FILTERS[number];

function LS_KEY() { return "capfolio_artifacts"; }
function load(): Artifact[] {
  try { const s = localStorage.getItem(LS_KEY()); return s ? JSON.parse(s) : SEED; } catch { return SEED; }
}
function save(a: Artifact[]) { try { localStorage.setItem(LS_KEY(), JSON.stringify(a)); } catch {} }

/* ── Preview Modal ── */
function PreviewModal({ artifact, onClose }: { artifact: Artifact; onClose: () => void }) {
  const Icon = ICON_MAP[artifact.type] ?? FileText;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
        style={{ background: "#2A2924", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${artifact.color}22` }}>
              <Icon size={16} style={{ color: artifact.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{artifact.title}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{artifact.size} · {artifact.created}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <X size={16} />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          <pre className="text-sm leading-relaxed font-mono whitespace-pre-wrap break-words"
            style={{ color: "var(--text-primary)" }}>{artifact.preview}</pre>
        </div>
        {/* Footer actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button onClick={() => { navigator.clipboard.writeText(artifact.preview).catch(() => {}); showToast("Copied to clipboard!"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Copy size={13} /> Copy
          </button>
          <button onClick={() => {
            const blob = new Blob([artifact.preview], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `${artifact.title}.txt`; a.click();
            URL.revokeObjectURL(url); showToast("Download started!");
          }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Download size={13} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArtifactsView() {
  const [artifacts, setArtifacts] = useState<Artifact[]>(SEED);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [preview, setPreview] = useState<Artifact | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => { setArtifacts(load()); }, []);

  const filtered = activeFilter === "All"
    ? artifacts
    : artifacts.filter(a => a.type === activeFilter.toLowerCase());

  const handleCopy = (a: Artifact) => {
    navigator.clipboard.writeText(a.preview).catch(() => {});
    setCopied(a.id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (a: Artifact) => {
    const blob = new Blob([a.preview], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a"); el.href = url; el.download = `${a.title}.txt`; el.click();
    URL.revokeObjectURL(url);
    showToast("Download started!");
  };

  return (
    <>
      {preview && <PreviewModal artifact={preview} onClose={() => setPreview(null)} />}
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Artifacts</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>All outputs generated across your conversations</p>
          </div>
          <div className="flex items-center gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background: activeFilter === f ? "rgba(201,100,66,0.15)" : "rgba(255,255,255,0.04)",
                  color: activeFilter === f ? "var(--accent-orange)" : "var(--text-secondary)",
                  border: `1px solid ${activeFilter === f ? "rgba(201,100,66,0.3)" : "transparent"}`,
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 px-8 py-6 flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No {activeFilter.toLowerCase()} artifacts yet.</p>
            </div>
          )}
          {filtered.map(artifact => {
            const Icon = ICON_MAP[artifact.type] ?? FileText;
            return (
              <div key={artifact.id}
                className="rounded-2xl p-4 flex gap-4 group cursor-pointer transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}
                onClick={() => setPreview(artifact)}
                onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,255,255,0.06)"); (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"); }}
                onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,255,255,0.03)"); (e.currentTarget.style.borderColor = "var(--border-color)"); }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${artifact.color}22` }}>
                  <Icon size={18} style={{ color: artifact.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{artifact.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
                      style={{ background: `${TYPE_COLOR[artifact.type]}22`, color: TYPE_COLOR[artifact.type] }}>
                      {artifact.type}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2 font-mono" style={{ color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>
                    {artifact.preview}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{artifact.size}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{artifact.created}</span>
                  </div>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  onClick={e => e.stopPropagation()}>
                  {[
                    { icon: Eye, label: "Preview", action: () => setPreview(artifact) },
                    { icon: copied === artifact.id ? Check : Copy, label: "Copy", action: () => handleCopy(artifact) },
                    { icon: Download, label: "Download", action: () => handleDownload(artifact) },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} onClick={action} title={label}
                      className="p-2 rounded-lg transition-all duration-150"
                      style={{ color: copied === artifact.id && label === "Copy" ? "#3EA86A" : "var(--text-muted)" }}
                      onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,255,255,0.08)"); (e.currentTarget.style.color = "var(--text-primary)"); }}
                      onMouseLeave={e => { (e.currentTarget.style.background = "transparent"); (e.currentTarget.style.color = "var(--text-muted)"); }}>
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
