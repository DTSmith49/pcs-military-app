"use client";

import { useRouter } from "next/navigation";

export default function AppNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="w-full bg-[#1B2A4A] text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg tracking-tight">🎖️ PCS Schools</span>
        <a href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">
          My Dashboard
        </a>
        <a href="/review" className="text-sm text-slate-300 hover:text-white transition-colors">
          Log in / Write a Review
        </a>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-colors"
      >
        Log out
      </button>
    </nav>
  );
}
