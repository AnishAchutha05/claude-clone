"use client";

const chips = [
  { label: "Write", emoji: "✍️" },
  { label: "Learn", emoji: "📚" },
  { label: "</> Code", emoji: null },
  { label: "Life stuff", emoji: "🌿" },
  { label: "Surprise me", emoji: "✨" },
];

interface SuggestionChipsProps {
  onSelect?: (label: string) => void;
}

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-2xl mx-auto">
      {chips.map(({ label, emoji }) => (
        <button
          key={label}
          onClick={() => onSelect?.(label)}
          className="chip-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
        >
          {emoji && <span className="text-sm leading-none">{emoji}</span>}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
