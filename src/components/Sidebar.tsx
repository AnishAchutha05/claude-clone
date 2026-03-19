"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Plus,
  Search,
  Settings2,
  MessageSquare,
  FolderKanban,
  Box,
  Code2,
  ArrowUpRight,
} from "lucide-react";

export type Page = "chats" | "search" | "customize" | "projects" | "artifacts" | "code";

const navItems: { icon: React.ElementType; label: string; page: Page }[] = [
  { icon: MessageSquare, label: "Chats", page: "chats" },
  { icon: FolderKanban, label: "Projects", page: "projects" },
  { icon: Box, label: "Artifacts", page: "artifacts" },
  { icon: Code2, label: "Code", page: "code" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ collapsed, onToggle, activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? "0px" : "260px",
        minWidth: collapsed ? "0px" : "260px",
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-color)",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "260px", height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-4" style={{ minHeight: "60px" }}>
          <button
            onClick={() => onNavigate("chats")}
            className="flex items-center gap-2"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, var(--accent-orange) 0%, #A0462A 100%)",
              }}
            >
              C
            </div>
            <span
              className="font-semibold text-sm tracking-wide"
              style={{ color: "var(--text-primary)" }}
            >
              CapFolio
            </span>
          </button>
          <button
            onClick={onToggle}
            className="sidebar-item p-1.5"
            style={{ color: "var(--text-muted)" }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Primary Actions */}
        <div className="px-3 flex flex-col gap-1 mb-2">
          {/* New chat always navigates back to chats with a reset (handled in parent) */}
          <button
            onClick={() => onNavigate("chats")}
            className={`sidebar-item flex items-center gap-3 px-3 py-2.5 w-full text-left ${activePage === "chats" ? "active" : ""}`}
            style={{ color: "var(--text-secondary)", fontSize: "13.5px" }}
          >
            <Plus size={20} strokeWidth={2} style={{ color: "var(--text-secondary)" }} />
            <span>New chat</span>
          </button>
          <button
            onClick={() => onNavigate("search")}
            className={`sidebar-item flex items-center gap-3 px-3 py-2.5 w-full text-left ${activePage === "search" ? "active" : ""}`}
            style={{
              color: activePage === "search" ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "13.5px",
            }}
          >
            <Search size={20} strokeWidth={1.8} style={{ color: activePage === "search" ? "var(--text-primary)" : "var(--text-secondary)" }} />
            <span>Search</span>
          </button>
          <button
            onClick={() => onNavigate("customize")}
            className={`sidebar-item flex items-center gap-3 px-3 py-2.5 w-full text-left ${activePage === "customize" ? "active" : ""}`}
            style={{
              color: activePage === "customize" ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "13.5px",
            }}
          >
            <Settings2 size={20} strokeWidth={1.8} style={{ color: activePage === "customize" ? "var(--text-primary)" : "var(--text-secondary)" }} />
            <span>Customize</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border-color)", margin: "4px 12px" }} />

        {/* Navigation Group */}
        <div className="px-3 pt-3 pb-1">
          <p
            className="px-3 mb-1.5 text-xs font-medium uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Library
          </p>
          <div className="flex flex-col gap-0.5">
            {navItems.map(({ icon: Icon, label, page }) => (
              <button
                key={label}
                onClick={() => onNavigate(page)}
                className={`sidebar-item flex items-center gap-3 px-3 py-2 w-full text-left ${activePage === page ? "active" : ""}`}
                style={{
                  color: activePage === page ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: "13.5px",
                }}
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacer to push profile to bottom */}
        <div className="flex-1" />

        {/* User Profile */}
        <div
          className="px-3 py-3 mt-auto"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <button
            onClick={() => onNavigate("customize")}
            className="sidebar-item flex items-center gap-3 px-3 py-2.5 w-full"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #C96442 0%, #A0462A 100%)",
                color: "white",
              }}
            >
              AA
            </div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <span
                className="text-sm font-medium truncate w-full"
                style={{ color: "var(--text-primary)" }}
              >
                Anish Achutha
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Free plan
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium flex-shrink-0"
              style={{
                background: "rgba(201, 100, 66, 0.15)",
                color: "var(--accent-orange-light)",
                border: "1px solid rgba(201, 100, 66, 0.25)",
              }}
            >
              <ArrowUpRight size={11} strokeWidth={2.5} />
              <span>Pro</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
