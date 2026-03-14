"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppNav() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  }

  return (
    <nav className="w-full bg-[#1B2A4A] text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <a href="/" className="font-bold text-lg tracking-tight">🎖️ PCS Schools</a>

        {isLoggedIn && (
          <a href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors">
            My Dashboard
          </a>
        )}

        {isLoggedIn === false && (
          <>
            <a href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Log In
            </a>
            <a href="/register" className="text-sm text-slate-300 hover:text-white transition-colors">
              Sign Up
            </a>
          </>
        )}
      </div>

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-colors"
        >
          Log out
        </button>
      )}

      {isLoggedIn === false && (
        <a
          href="/review"
          className="text-sm bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-colors"
        >
          Write a Review
        </a>
      )}
    </nav>
  );
}