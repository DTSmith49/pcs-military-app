"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete review. Please try again.");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-600 font-semibold hover:underline disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-slate-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
    >
      Delete
    </button>
  );
}
