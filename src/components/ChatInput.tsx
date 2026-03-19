"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, ChevronDown, Mic, MicOff, Paperclip } from "lucide-react";
import { showToast } from "@/components/Toast";

const models = [
  { id: "qwen2.5-coder:1.5b", label: "Qwen Coder 1.5B ⚡" },
  { id: "llama3.2:3b", label: "Llama 3.2 3B" },
  { id: "deepseek-r1:8b", label: "DeepSeek R1 8B" },
];

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
  onModelChange?: (modelId: string) => void;
  /** Optional external value to set the textarea (e.g. from suggestion chips) */
  prefillValue?: string;
  onPrefillConsumed?: () => void;
}

// Web Speech API types (not always in tsconfig lib)
interface SpeechRecognitionResult { readonly 0: { transcript: string }; }
interface SpeechRecognitionResultList { readonly 0: SpeechRecognitionResult; }
interface SpeechRecognitionEvent { results: SpeechRecognitionResultList; }
interface SpeechRecognitionErrorEvent { error: string; }
interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function ChatInput({ onSend, disabled = false, onModelChange, prefillValue, onPrefillConsumed }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [modelOpen, setModelOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Apply prefill from suggestion chips
  useEffect(() => {
    if (prefillValue) {
      setMessage(prefillValue);
      textareaRef.current?.focus();
      onPrefillConsumed?.();
    }
  }, [prefillValue, onPrefillConsumed]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setModelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cleanup speech on unmount
  useEffect(() => () => { recognitionRef.current?.abort(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!disabled) handleSend(); }
  };

  const handleSend = () => {
    if (message.trim() && !disabled) { onSend?.(message.trim()); setMessage(""); }
  };

  /* ── Voice Input ── */
  const handleVoice = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { showToast("Voice input not supported in this browser", "error"); return; }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);
      if (e.error !== "aborted") showToast("Voice recognition error: " + e.error, "error");
    };
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setMessage(prev => (prev ? prev + " " + transcript : transcript));
      textareaRef.current?.focus();
    };
    recognition.start();
  }, [isRecording]);

  /* ── File Attachment ── */
  const handleAttachment = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = Math.round(file.size / 1024);
    const note = `[Attached: ${file.name} (${sizeKB} KB)]`;
    setMessage(prev => prev ? `${prev}\n${note}` : note);
    showToast(`Attached: ${file.name}`);
    e.target.value = ""; // reset so same file can be picked again
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* Main Input Container */}
      <div className="input-container relative rounded-2xl"
        style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)" }}>
        {/* Top row: attachment + textarea */}
        <div className="flex items-start gap-2 px-4 pt-4 pb-2">
          {/* Attachment */}
          <button onClick={handleAttachment}
            className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg transition-all duration-150"
            style={{ color: "var(--text-muted)" }} title="Attach file"
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <Paperclip size={17} strokeWidth={2} />
          </button>

          {/* Textarea */}
          <textarea ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Waiting for response..." : isRecording ? "🎤 Listening..." : "How can I help you today?"}
            disabled={disabled} rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
            style={{
              color: disabled ? "var(--text-muted)" : "var(--text-primary)",
              minHeight: "28px", maxHeight: "200px",
              cursor: disabled ? "not-allowed" : "text",
            }} />
        </div>

        {/* Bottom row: model selector + voice + send */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Model Selector */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setModelOpen(!modelOpen)}
              className="model-selector flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{ color: "var(--text-secondary)", border: "1px solid transparent" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => { if (!modelOpen) e.currentTarget.style.borderColor = "transparent"; }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--accent-orange)" }} />
              <span>{selectedModel.label}</span>
              <ChevronDown size={12} strokeWidth={2.5}
                className="transition-transform duration-150"
                style={{ transform: modelOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            {modelOpen && (
              <div className="absolute bottom-full mb-2 left-0 rounded-xl py-1 min-w-[180px] z-50"
                style={{ background: "#2E2C27", border: "1px solid var(--border-color)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                {models.map(m => (
                  <button key={m.id}
                    onClick={() => { setSelectedModel(m); setModelOpen(false); onModelChange?.(m.id); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-all duration-100"
                    style={{
                      color: selectedModel.id === m.id ? "var(--text-primary)" : "var(--text-secondary)",
                      background: selectedModel.id === m.id ? "rgba(255,255,255,0.05)" : "transparent",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedModel.id === m.id ? "rgba(255,255,255,0.05)" : "transparent"; }}>
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background: selectedModel.id === m.id ? "var(--accent-orange)" : "var(--text-muted)" }} />
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Voice button */}
            <button onClick={handleVoice}
              className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
              title={isRecording ? "Stop recording" : "Voice input"}
              style={{
                background: isRecording ? "rgba(201,100,66,0.18)" : "transparent",
                color: isRecording ? "var(--accent-orange)" : "var(--text-muted)",
              }}
              onMouseEnter={e => { if (!isRecording) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { if (!isRecording) e.currentTarget.style.background = "transparent"; }}>
              {isRecording ? (
                <div className="flex items-end gap-0.5" style={{ height: "16px" }}>
                  {["6px", "10px", "4px", "8px"].map((h, i) => (
                    <div key={i} className={`eq-bar-${i + 1} rounded-full`}
                      style={{ width: "3px", background: "var(--accent-orange)", height: h }} />
                  ))}
                </div>
              ) : (
                <Mic size={16} strokeWidth={1.8} />
              )}
            </button>

            {/* Send button */}
            <button onClick={handleSend} disabled={!message.trim() || disabled}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: message.trim() && !disabled ? "var(--accent-orange)" : "rgba(255,255,255,0.06)",
                color: message.trim() && !disabled ? "white" : "var(--text-muted)",
                cursor: message.trim() && !disabled ? "pointer" : "not-allowed",
              }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
