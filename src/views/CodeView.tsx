"use client";

import { useState } from "react";
import { Play, Copy, Check, ChevronDown, Terminal } from "lucide-react";
import { showToast } from "@/components/Toast";

const snippets = [
  {
    id: 1, title: "Debounce Hook", language: "TypeScript", langColor: "#5B8DEF", runnable: false,
    code: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
  },
  {
    id: 2, title: "Fetch with Retry", language: "JavaScript", langColor: "#D4A96A", runnable: true,
    code: `async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

// Demo call (will fail — no real URL — but shows retry logic)
fetchWithRetry("https://httpbin.org/get")
  .then(d => console.log("Success:", JSON.stringify(d).slice(0, 80)))
  .catch(e => console.error("Failed after retries:", e.message));`,
  },
  {
    id: 3, title: "Rate Limiter Class", language: "Python", langColor: "#3EA86A", runnable: false,
    code: `import time
from collections import deque

class RateLimiter:
    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self.calls = deque()

    def is_allowed(self) -> bool:
        now = time.monotonic()
        while self.calls and now - self.calls[0] > self.period:
            self.calls.popleft()
        if len(self.calls) < self.max_calls:
            self.calls.append(now)
            return True
        return False`,
  },
  {
    id: 4, title: "Array Utilities", language: "JavaScript", langColor: "#D4A96A", runnable: true,
    code: `// Useful array utility functions

const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size));

const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});

const unique = (arr) => [...new Set(arr)];

// Demo
const nums = [1, 2, 3, 4, 5, 6, 7, 8];
console.log("chunk(4):", JSON.stringify(chunk(nums, 4)));
console.log("unique:", JSON.stringify(unique([1,1,2,3,3,4])));

const people = [{dept:"eng",name:"Alice"},{dept:"eng",name:"Bob"},{dept:"hr",name:"Carol"}];
console.log("groupBy dept:", JSON.stringify(groupBy(people, "dept")));`,
  },
];

function runJavaScript(code: string): string[] {
  const logs: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => logs.push(args.map(a =>
      typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ")),
    error: (...args: unknown[]) => logs.push("Error: " + args.join(" ")),
    warn: (...args: unknown[]) => logs.push("Warn: " + args.join(" ")),
  };
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("console", code);
    fn(fakeConsole);
  } catch (e) {
    logs.push(`Runtime error: ${e instanceof Error ? e.message : String(e)}`);
  }
  return logs.length ? logs : ["(no output)"];
}

export default function CodeView() {
  const [copied, setCopied] = useState<number | null>(null);
  const [activeSnippet, setActiveSnippet] = useState(snippets[0]);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRun = () => {
    if (!activeSnippet.runnable) {
      setOutput([`ℹ️ ${activeSnippet.language} can't run in the browser.`, "Copy the code and run it locally."]);
      return;
    }
    setIsRunning(true);
    setOutput(["⟳ Running..."]);
    // Small timeout so UI updates before potentially blocking eval
    setTimeout(() => {
      const result = runJavaScript(activeSnippet.code);
      setOutput(result);
      setIsRunning(false);
    }, 50);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Snippet list */}
      <div className="w-64 flex flex-col flex-shrink-0 border-r overflow-y-auto"
        style={{ borderColor: "var(--border-color)", background: "rgba(0,0,0,0.15)" }}>
        <div className="flex flex-col pt-16 pb-2">
          {snippets.map(s => (
            <button key={s.id} onClick={() => { setActiveSnippet(s); setOutput([]); }}
              className="px-4 py-3 text-left transition-all duration-150"
              style={{
                background: activeSnippet.id === s.id ? "rgba(255,255,255,0.06)" : "transparent",
                borderLeft: activeSnippet.id === s.id ? "2px solid var(--accent-orange)" : "2px solid transparent",
              }}>
              <p className="text-sm font-medium truncate"
                style={{ color: activeSnippet.id === s.id ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {s.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full" style={{ background: s.langColor }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.language}</span>
                {s.runnable && <span className="text-xs px-1.5 rounded" style={{ background: "rgba(62,168,106,0.15)", color: "#3EA86A" }}>runnable</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <Terminal size={16} style={{ color: "var(--text-muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{activeSnippet.title}</span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
              style={{ background: `${activeSnippet.langColor}22`, color: activeSnippet.langColor }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeSnippet.langColor }} />
              {activeSnippet.language}
              <ChevronDown size={11} />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleCopy(activeSnippet.id, activeSnippet.code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{ background: "rgba(255,255,255,0.06)", color: copied === activeSnippet.id ? "#3EA86A" : "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {copied === activeSnippet.id ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
            <button onClick={handleRun} disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{ background: "var(--accent-orange)", color: "white", opacity: isRunning ? 0.7 : 1 }}>
              <Play size={12} fill="white" />
              {isRunning ? "Running..." : "Run"}
            </button>
          </div>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="text-sm leading-relaxed font-mono"
            style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            <code>{activeSnippet.code}</code>
          </pre>
        </div>

        {/* Terminal output */}
        <div className="border-t px-5 py-3 flex-shrink-0 min-h-[72px]"
          style={{ borderColor: "var(--border-color)", background: "rgba(0,0,0,0.25)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={12} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Output</span>
          </div>
          {output.length === 0 ? (
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Ready to run...</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {output.map((line, i) => (
                <p key={i} className="text-xs font-mono" style={{ color: line.startsWith("Error") || line.startsWith("Runtime") ? "#E06C75" : "var(--text-primary)" }}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
