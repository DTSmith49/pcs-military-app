"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

type MeResponse = {
  loggedIn: boolean;
  user: {
    id: string;
    email: string;
    role?: string;
  } | null;
  message?: string;
};

export default function NavClient() {
  const [auth, setAuth] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data: MeResponse = await res.json();
        if (!cancelled) setAuth(data);
      } catch {
        if (!cancelled) setAuth({ loggedIn: false, user: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMe();
    return () => { cancelled = true; };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.href = "/";
    }
  };

  const loggedIn = auth?.loggedIn ?? false;
  const email = auth?.user?.email ?? "";
  const initial = email ? email[0].toUpperCase() : "?";

  if (loading) {
    return <div className="w-40 h-8" />;
  }

  return (
    <>
      {/* Desktop nav */}
      <nav
        aria-label="Main navigation"
        className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
      >
        <Link href="/schools" className="hover:text-blue-600 transition-colors">
          Find Schools
        </Link>
        <Link href="/sources" className="hover:text-blue-600 transition-colors">
          Sources
        </Link>

        {loggedIn ? (
          <div className="relative" ref={menuRef}>
            {/* Avatar button */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="w-9 h-9 rounded-full bg-[#1B2A4A] text-white font-bold text-sm flex items-center justify-center hover:bg-[#243860] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8A020]"
            >
              {initial}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-400 truncate">{email}</p>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  📋 My Dashboard
                </Link>
                <Link
                  href="/review"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ✏️ Write a Review
                </Link>
                <div className="border-t border-slate-100 mt-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-[#E8A020] hover:bg-[#cf8b14] text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            Log in / Write a Review
          </Link>
        )}
      </nav>

      {/* Mobile nav */}
      <div className="flex md:hidden items-center gap-3">
        {loggedIn ? (
          <>
            <Link
              href="/review"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Review
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-[#1B2A4A] text-white font-bold text-xs flex items-center justify-center hover:bg-[#243860] transition-colors"
              aria-label="Log out"
            >
              {initial}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-[#E8A020] hover:bg-[#cf8b14] text-white px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
          >
            Log in / Review
          </Link>
        )}
      </div>
    </>
  );
}
