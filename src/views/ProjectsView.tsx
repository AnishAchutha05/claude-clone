"use client";

import { useState, useEffect, useRef } from "react";
import { FolderKanban, Plus, MoreHorizontal, Users, Calendar, X, Trash2, Edit2, Check } from "lucide-react";
import { showToast } from "@/components/Toast";

interface Project {
  id: number;
  name: string;
  description: string;
  tags: string[];
  chats: number;
  lastActive: string;
  color: string;
}

const COLORS = ["#C96442", "#5B8DEF", "#7C5CBF", "#3EA86A", "#E06C75", "#D4A96A"];
const SEED: Project[] = [
  { id: 1, name: "Marketing Campaign Q2", description: "Brand messaging, copy drafts, and social media content for Q2 launch.", tags: ["Marketing", "Copy"], chats: 12, lastActive: "2h ago", color: "#C96442" },
  { id: 2, name: "Backend API Redesign", description: "Architectural planning and code generation for the new REST API layer.", tags: ["Engineering", "Code"], chats: 28, lastActive: "Yesterday", color: "#5B8DEF" },
  { id: 3, name: "Investor Deck 2026", description: "Pitch deck narrative, financial model explanations, and slide content.", tags: ["Finance", "Writing"], chats: 7, lastActive: "3 days ago", color: "#7C5CBF" },
  { id: 4, name: "Personal Research Hub", description: "Notes, summaries, and explorations across various topics of interest.", tags: ["Research", "Learning"], chats: 44, lastActive: "1 week ago", color: "#3EA86A" },
];

function load(): Project[] {
  try { const s = localStorage.getItem("capfolio_projects"); return s ? JSON.parse(s) : SEED; } catch { return SEED; }
}
function save(p: Project[]) { try { localStorage.setItem("capfolio_projects", JSON.stringify(p)); } catch {} }

/* ── New Project Modal ── */
function NewProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (p: Project) => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  const handleSubmit = () => {
    if (!name.trim()) { showToast("Please enter a project name", "error"); return; }
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    onSave({
      id: Date.now(),
      name: name.trim(),
      description: desc.trim() || "New project workspace",
      tags: tags.length ? tags : ["General"],
      chats: 0,
      lastActive: "Just now",
      color: COLORS[colorIdx],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "#2A2924", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <X size={15} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {/* Color picker */}
          <div className="flex items-center gap-2">
            {COLORS.map((c, i) => (
              <button key={c} onClick={() => setColorIdx(i)}
                className="w-6 h-6 rounded-full transition-all"
                style={{ background: c, outline: colorIdx === i ? `2px solid white` : "none", outlineOffset: "2px" }} />
            ))}
          </div>
          {[
            { label: "Project name", value: name, set: setName, placeholder: "e.g. Website Redesign" },
            { label: "Description", value: desc, set: setDesc, placeholder: "What's this project about?" },
            { label: "Tags (comma separated)", value: tagsInput, set: setTagsInput, placeholder: "e.g. Design, UI" },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>{label}</label>
              <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(201,100,66,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
            </div>
          ))}
          <button onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl text-sm font-semibold mt-1 transition-all"
            style={{ background: "var(--accent-orange)", color: "white" }}>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ⋯ Context Menu ── */
function ProjectMenu({ project, onDelete, onRename }: { project: Project; onDelete: () => void; onRename: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(project.name);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(o => !o)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-150"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 rounded-xl py-1 min-w-[140px]"
          style={{ background: "#2E2C27", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          {renaming ? (
            <div className="flex items-center gap-1.5 px-3 py-2">
              <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
                className="flex-1 bg-transparent outline-none text-xs" style={{ color: "var(--text-primary)" }}
                onKeyDown={e => { if (e.key === "Enter") { onRename(nameVal); setRenaming(false); setOpen(false); } }} />
              <button onClick={() => { onRename(nameVal); setRenaming(false); setOpen(false); }}>
                <Check size={13} style={{ color: "#3EA86A" }} />
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setRenaming(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-all"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Edit2 size={12} /> Rename
              </button>
              <button onClick={() => { onDelete(); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-all"
                style={{ color: "#E06C75" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(224,108,117,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Trash2 size={12} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface ProjectsViewProps {
  onOpenProjectChat?: (projectName: string) => void;
}

export default function ProjectsView({ onOpenProjectChat }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { setProjects(load()); }, []);

  const updateProjects = (updated: Project[]) => { setProjects(updated); save(updated); };

  const handleCreate = (p: Project) => { const updated = [...projects, p]; updateProjects(updated); showToast(`Project "${p.name}" created!`); };
  const handleDelete = (id: number) => {
    const name = projects.find(p => p.id === id)?.name;
    updateProjects(projects.filter(p => p.id !== id));
    showToast(`"${name}" deleted`);
  };
  const handleRename = (id: number, name: string) => {
    updateProjects(projects.map(p => p.id === id ? { ...p, name } : p));
    showToast("Project renamed!");
  };

  return (
    <>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Projects</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Organize your chats into focused workspaces</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ background: "var(--accent-orange)", color: "white" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            <Plus size={16} strokeWidth={2} /> New project
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
          {projects.map(project => (
            <div key={project.id}
              className="rounded-2xl p-5 flex flex-col gap-4 group cursor-pointer transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}
              onClick={() => onOpenProjectChat?.(project.name)}
              onMouseEnter={e => { (e.currentTarget.style.background = "rgba(255,255,255,0.06)"); (e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"); }}
              onMouseLeave={e => { (e.currentTarget.style.background = "rgba(255,255,255,0.03)"); (e.currentTarget.style.borderColor = "var(--border-color)"); }}>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${project.color}22` }}>
                  <FolderKanban size={20} style={{ color: project.color }} />
                </div>
                <ProjectMenu project={project} onDelete={() => handleDelete(project.id)} onRename={name => handleRename(project.id, name)} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>{project.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{project.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1.5">
                  <Users size={12} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{project.chats} chats</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} style={{ color: "var(--text-muted)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{project.lastActive}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Create card */}
          <button onClick={() => setShowModal(true)}
            className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3 border-dashed transition-all duration-200 min-h-[180px]"
            style={{ border: "1.5px dashed rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
            onMouseEnter={e => { (e.currentTarget.style.borderColor = "rgba(201,100,66,0.4)"); (e.currentTarget.style.color = "var(--accent-orange)"); (e.currentTarget.style.background = "rgba(201,100,66,0.05)"); }}
            onMouseLeave={e => { (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"); (e.currentTarget.style.color = "var(--text-muted)"); (e.currentTarget.style.background = "transparent"); }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
              <Plus size={20} />
            </div>
            <span className="text-sm font-medium">Create a project</span>
          </button>
        </div>
      </div>
    </>
  );
}
