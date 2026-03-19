"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  text: string;
  type?: "success" | "info" | "error";
}

let toastId = 0;
let globalSetToast: ((t: ToastMessage | null) => void) | null = null;

export function showToast(text: string, type: ToastMessage["type"] = "success") {
  globalSetToast?.({ id: ++toastId, text, type });
}

export default function Toast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    globalSetToast = setToast;
    return () => { globalSetToast = null; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  const bg =
    toast.type === "error" ? "rgba(220,60,60,0.9)"
    : toast.type === "info" ? "rgba(91,141,239,0.9)"
    : "rgba(62,168,106,0.9)";

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg"
      style={{
        background: bg,
        color: "white",
        transform: "translateX(-50%)",
        animation: "fadeInUp 0.2s ease",
      }}
    >
      <CheckCircle2 size={15} />
      {toast.text}
      <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100">
        <X size={13} />
      </button>
    </div>
  );
}
