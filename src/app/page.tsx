"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PanelLeftOpen, Brain } from "lucide-react";
import Sidebar, { type Page } from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import SuggestionChips from "@/components/SuggestionChips";
import ProjectsView from "@/views/ProjectsView";
import ArtifactsView from "@/views/ArtifactsView";
import CodeView from "@/views/CodeView";
import SearchView from "@/views/SearchView";
import CustomizeView from "@/views/CustomizeView";
import Toast from "@/components/Toast";

/* ── Types ── */
type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
  thinking?: string;
  streaming?: boolean;
}

/* ── Sparkle icon ── */
function SparkleIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
      xmlns="http://www.w3.org/2000/svg" className="animate-sparkle" aria-hidden="true">
      <path d="M18 2L20.1 14.7L28.5 7.5L21.3 15.9L34 18L21.3 20.1L28.5 28.5L20.1 21.3L18 34L15.9 21.3L7.5 28.5L14.7 20.1L2 18L14.7 15.9L7.5 7.5L15.9 14.7L18 2Z"
        fill="#C96442" opacity="0.9" />
      <circle cx="18" cy="5" r="1.2" fill="#D4734E" opacity="0.6" />
      <circle cx="31" cy="18" r="1.2" fill="#D4734E" opacity="0.6" />
      <circle cx="18" cy="31" r="1.2" fill="#D4734E" opacity="0.6" />
      <circle cx="5" cy="18" r="1.2" fill="#D4734E" opacity="0.6" />
    </svg>
  );
}

/* ── Thinking block (collapsible) ── */
function ThinkingBlock({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
        style={{ color: "var(--accent-orange)", background: "rgba(201,100,66,0.08)", border: "1px solid rgba(201,100,66,0.18)" }}>
        <Brain size={12} />
        {open ? "Hide" : "Show"} thinking
        <span style={{ opacity: 0.6 }}>({Math.ceil(text.split(" ").length / 8)}s)</span>
      </button>
      {open && (
        <div className="mt-2 px-3 py-2 rounded-xl text-xs leading-relaxed font-mono"
          style={{ background: "rgba(201,100,66,0.05)", border: "1px solid rgba(201,100,66,0.12)", color: "var(--text-muted)", whiteSpace: "pre-wrap", maxHeight: "240px", overflowY: "auto" }}>
          {text}
        </div>
      )}
    </div>
  );
}

/* ── Chat bubble ── */
function ChatBubble({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="px-4 py-3 rounded-2xl text-sm max-w-xl"
          style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-primary)", border: "1px solid var(--border-color)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl w-full">
        {msg.thinking && <ThinkingBlock text={msg.thinking} />}
        <div className="rounded-2xl text-sm leading-relaxed"
          style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
              style={{ background: "var(--accent-orange)" }} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Typing dots ── */
function ThinkingDots() {
  return (
    <div className="flex justify-start">
      <div className="px-4 py-3 rounded-2xl text-sm"
        style={{ background: "rgba(201,100,66,0.08)", border: "1px solid rgba(201,100,66,0.2)" }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ background: "var(--accent-orange)", animationDelay: `${d}ms` }} />
            ))}
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Thinking...</span>
        </div>
      </div>
    </div>
  );
}

/* ── Chip starters ── */
const CHIP_STARTERS: Record<string, string> = {
  Write: "Help me write ",
  Learn: "Explain ",
  "</> Code": "Write code that ",
  "Life stuff": "Give me advice on ",
  "Surprise me": "Surprise me with something fascinating about ",
};

/* ── ChatsView ── */
function ChatsView({
  messages, isLoading, onSend, onModelChange, projectContext,
}: {
  messages: Message[];
  isLoading: boolean;
  onSend: (msg: string) => void;
  onModelChange: (id: string) => void;
  projectContext?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [prefill, setPrefill] = useState("");

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleChip = (label: string) => {
    setPrefill(CHIP_STARTERS[label] || label);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {messages.length > 0 ? (
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
            {isLoading && messages[messages.length - 1]?.role === "user" && <ThinkingDots />}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 pb-8 pt-16">
            <div className="flex flex-col items-center gap-5 mb-12 animate-fade-in-up">
              <div className="relative">
                <SparkleIcon />
                <div className="absolute inset-0 rounded-full blur-xl opacity-30"
                  style={{ background: "var(--accent-orange)", transform: "scale(1.5)" }} />
              </div>
              <h1 className="font-serif-greeting text-4xl lg:text-5xl font-medium text-center leading-tight"
                style={{ color: "var(--text-primary)" }}>
                {projectContext ? `📁 ${projectContext}` : "Hello, night owl"}
              </h1>
              <p className="text-base text-center max-w-sm animate-fade-in-up delay-100"
                style={{ color: "var(--text-secondary)" }}>
                {projectContext
                  ? `You're in the "${projectContext}" project. Ask anything related.`
                  : "Powered by your local LLM. What's on your mind?"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full px-4 pb-6 pt-3 flex flex-col items-center gap-4"
        style={{ background: `linear-gradient(to top, var(--main-bg) 80%, transparent)` }}>
        {messages.length === 0 && (
          <div className="w-full animate-fade-in-up delay-300">
            <SuggestionChips onSelect={handleChip} />
          </div>
        )}
        <div className="w-full animate-fade-in-up delay-200">
          <ChatInput
            onSend={onSend}
            disabled={isLoading}
            onModelChange={onModelChange}
            prefillValue={prefill}
            onPrefillConsumed={() => setPrefill("")}
          />
        </div>
        <p className="text-xs text-center animate-fade-in-up delay-400" style={{ color: "var(--text-muted)" }}
          suppressHydrationWarning>
          Running locally via Ollama · use the model selector to switch models
        </p>
      </div>
    </>
  );
}

/* ── Root page ── */
export default function HomePage() {
  const abortRef = useRef<AbortController | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState<Page>("chats");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState("qwen2.5-coder:1.5b");
  const [isLoading, setIsLoading] = useState(false);
  const [projectContext, setProjectContext] = useState<string | undefined>();

  const handleNavigate = (page: Page) => {
    setActivePage(page);
    if (page === "chats") handleReset();
  };

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    setProjectContext(undefined);
  }, []);

  const handleOpenProjectChat = useCallback((projectName: string) => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    setProjectContext(projectName);
    setActivePage("chats");
  }, []);

  /* Save messages to localStorage (for Search history) */
  const persistHistory = useCallback((msgs: Message[]) => {
    try {
      const history = msgs
        .filter(m => m.role === "user")
        .map(m => ({ role: m.role, content: m.content, timestamp: new Date().toLocaleString() }));
      const old = JSON.parse(localStorage.getItem("capfolio_chat_history") || "[]");
      localStorage.setItem("capfolio_chat_history", JSON.stringify([...old, ...history].slice(-100)));
    } catch {}
  }, []);

  /* ── Stream a message ── */
  const handleSend = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const contextPrefix = projectContext
      ? [{ role: "system" as const, content: `You are helping with the project: "${projectContext}". Keep responses relevant to this project.` }]
      : [];

    const userMsg: Message = { role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    persistHistory([userMsg]);

    const assistantIdx = newMessages.length;
    setMessages(prev => [...prev, { role: "assistant", content: "", thinking: "", streaming: true }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: selectedModel,
          messages: [...contextPrefix, ...newMessages.map(m => ({ role: m.role, content: m.content }))],
        }),
      });

      if (!res.ok || !res.body) throw new Error(`API error ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let thinkContent = "";
      let inThink = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const { token } = JSON.parse(data) as { token: string };
            if (token.includes("<think>")) inThink = true;
            if (inThink) { thinkContent += token.replace(/<\/?think>/g, ""); if (token.includes("</think>")) inThink = false; }
            else { fullContent += token; }
            setMessages(prev => {
              const updated = [...prev];
              updated[assistantIdx] = { role: "assistant", content: fullContent, thinking: thinkContent || undefined, streaming: true };
              return updated;
            });
          } catch { /* skip */ }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = { role: "assistant", content: fullContent || "(empty response)", thinking: thinkContent || undefined, streaming: false };
        return updated;
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = { role: "assistant", content: "⚠️ Could not reach the model. Make sure Ollama is running (`ollama serve`).", streaming: false };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, selectedModel, projectContext, persistHistory]);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "var(--main-bg)" }}>
      {/* Global toast */}
      <Toast />

      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)}
        activePage={activePage} onNavigate={handleNavigate} />

      <main className="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden">
        {sidebarCollapsed && (
          <div className="absolute top-0 left-0 z-10 p-4">
            <button onClick={() => setSidebarCollapsed(false)}
              className="sidebar-item p-2.5"
              style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", borderRadius: "10px" }}
              title="Open sidebar">
              <PanelLeftOpen size={22} />
            </button>
          </div>
        )}

        <div key={activePage} className="flex flex-col flex-1 overflow-hidden animate-fade-in-up"
          style={{ animationDuration: "0.25s" }}>
          {activePage === "chats" && (
            <ChatsView messages={messages} isLoading={isLoading} onSend={handleSend}
              onModelChange={setSelectedModel} projectContext={projectContext} />
          )}
          {activePage === "projects" && <ProjectsView onOpenProjectChat={handleOpenProjectChat} />}
          {activePage === "artifacts" && <ArtifactsView />}
          {activePage === "code" && <CodeView />}
          {activePage === "search" && <SearchView />}
          {activePage === "customize" && <CustomizeView />}
        </div>
      </main>
    </div>
  );
}
