"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const data: MeResponse = await res.json();
        if (!cancelled) setAuth(data);
      } catch {
        if (!cancelled) {
          setAuth({ loggedIn: false, user: null });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  };

  const loggedIn = auth?.loggedIn ?? false;
  const displayName = auth?.user?.email
    ? auth.user.email.split("@")[0]
    : null;

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
        <Link
          href="/schools"
          className="hover:text-blue-600 transition-colors"
        >
          Find Schools
        </Link>
        <Link
          href="/sources"
          className="hover:text-blue-600 transition-colors"
        >
          Sources
        </Link>

        {loggedIn ? (
          <>
            <span className="text-slate-500 text-xs">
              Signed in{displayName ? ` as ${displayName}` : ""}
            </span>
            <Link
              href="/dashboard"
              className="hover:text-blue-600 transition-colors"
            >
              My Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-[#E8A020] hover:bg-[#cf8b14] text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Log out
            </button>
          </>
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
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-[#E8A020] hover:bg-[#cf8b14] text-white px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
            >
              Log out
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