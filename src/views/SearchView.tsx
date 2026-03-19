"use client";

import { useState, useEffect } from "react";
import { Search, X, MessageSquare, Code2, FileText, Clock } from "lucide-react";

interface Result {
  id: number;
  type: "chat" | "code" | "artifact";
  title: string;
  excerpt: string;
  time: string;
}

const SEED_RESULTS: Result[] = [
  { id: 1, type: "chat", title: "How compound interest works", excerpt: "Compound interest is the process of earning interest on both the principal amount and previously...", time: "2h ago" },
  { id: 2, type: "code", title: "REST API Handler (TypeScript)", excerpt: "async function fetchUserData(userId: string) { const res = await fetch...", time: "Yesterday" },
  { id: 3, type: "chat", title: "Bus arbitration explained", excerpt: "Bus arbitration is the process by which a single device is granted the right to initiate a transfer...", time: "Mar 17" },
  { id: 4, type: "artifact", title: "Marketing Email Template", excerpt: "Subject: Exciting news — we've just launched...", time: "Mar 16" },
  { id: 5, type: "chat", title: "React hooks deep dive", excerpt: "React hooks allow functional components to use state and other React features without writing a class...", time: "Mar 15" },
  { id: 6, type: "code", title: "Debounce Hook (TypeScript)", excerpt: "export function useDebounce<T>(value: T, delay: number): T {", time: "Mar 14" },
];

const ICON_MAP: Record<string, React.ElementType> = { chat: MessageSquare, code: Code2, artifact: FileText };
const COLOR_MAP: Record<string, string> = { chat: "#C96442", code: "#5B8DEF", artifact: "#3EA86A" };
const FILTERS = ["All", "Chats", "Code", "Artifacts"] as const;
type Filter = typeof FILTERS[number];

function filterTypeMatch(result: Result, filter: Filter): boolean {
  if (filter === "All") return true;
  if (filter === "Chats") return result.type === "chat";
  if (filter === "Code") return result.type === "code";
  if (filter === "Artifacts") return result.type === "artifact";
  return true;
}

function loadChatHistory(): Result[] {
  try {
    const raw = localStorage.getItem("capfolio_chat_history");
    if (!raw) return [];
    const history: Array<{ role: string; content: string; timestamp?: string }> = JSON.parse(raw);
    return history
      .filter(m => m.role === "user" && m.content.trim().length > 5)
      .slice(-20)
      .map((m, i) => ({
        id: 10000 + i,
        type: "chat" as const,
        title: m.content.slice(0, 60) + (m.content.length > 60 ? "..." : ""),
        excerpt: m.content,
        time: m.timestamp ?? "Recent",
      }));
  } catch { return []; }
}

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [allResults, setAllResults] = useState<Result[]>(SEED_RESULTS);

  useEffect(() => {
    const chatHistory = loadChatHistory();
    if (chatHistory.length > 0) {
      setAllResults([...chatHistory, ...SEED_RESULTS]);
    }
  }, []);

  const filtered = allResults.filter(r => {
    const matchesFilter = filterTypeMatch(r, activeFilter);
    const matchesQuery = !query.trim() ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "var(--border-color)" }}>
        <h1 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Search</h1>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)" }}>
          <Search size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search chats, artifacts, code..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }} />
          {query && (
            <button onClick={() => setQuery("")} style={{ color: "var(--text-muted)" }}>
              <X size={15} />
            </button>
          )}
        </div>
        {/* Filter chips */}
        <div className="flex items-center gap-2 mt-3">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
              style={{
                background: activeFilter === f ? "rgba(201,100,66,0.15)" : "rgba(255,255,255,0.04)",
                color: activeFilter === f ? "var(--accent-orange)" : "var(--text-secondary)",
                border: `1px solid ${activeFilter === f ? "rgba(201,100,66,0.3)" : "rgba(255,255,255,0.07)"}`,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {query && (
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
        )}
        {!query && (
          <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <Clock size={12} /> Recently accessed
          </p>
        )}
        <div className="flex flex-col gap-2">
          {filtered.map(result => {
            const Icon = ICON_MAP[result.type] ?? MessageSquare;
            const color = COLOR_MAP[result.type] ?? "#C96442";
            return (
              <button key={result.id}
                className="flex items-start gap-4 p-4 rounded-2xl text-left w-full transition-all duration-150"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}
                onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,255,255,0.06)"); (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"); }}
                onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,255,255,0.03)"); (e.currentTarget.style.borderColor = "var(--border-color)"); }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}22` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{result.title}</p>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{result.time}</span>
                  </div>
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--text-secondary)" }}>{result.excerpt}</p>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3">
              <Search size={32} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No results{query ? ` for "${query}"` : ""}{activeFilter !== "All" ? ` in ${activeFilter}` : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
