// components/Tooltip.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export function Tooltip({
  label = "What is this?",
  body,
}: {
  label?: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).slice(2)}`);
  const containerRef = useRef<HTMLSpanElement>(null);

  // A-04: close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // A-04: close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-block">
      {/* A-04: aria-expanded + aria-describedby on trigger */}
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tooltipId.current : undefined}
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-blue-600 underline"
      >
        {label}
      </button>
      {/* A-04: role=tooltip + matching id */}
      {open && (
        <div
          id={tooltipId.current}
          role="tooltip"
          className="absolute z-20 mt-1 w-64 rounded border border-slate-300 bg-white p-2 text-xs text-slate-700 shadow"
        >
          {body}
        </div>
      )}
    </span>
  );
}
