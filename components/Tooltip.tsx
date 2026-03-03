// components/Tooltip.tsx
"use client";

import { useState } from "react";

export function Tooltip({
  label = "What is this?",
  body,
}: {
  label?: string;
  body: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-blue-600 underline"
      >
        {label}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-64 rounded border border-slate-300 bg-white p-2 text-xs text-slate-700 shadow">
          {body}
        </div>
      )}
    </span>
  );
}
