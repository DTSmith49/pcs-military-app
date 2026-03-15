// app/page.tsx
import Link from "next/link";
import {
  Search,
  BookOpen,
  PenLine,
  GraduationCap,
  ClipboardList,
  HandHeart,
  Users,
  Megaphone,
  Star,
  Trophy,
  Banknote,
  Timer,
} from "lucide-react";

// CHANGE 4: Replaced emoji with Lucide SVG icons throughout all three data arrays

const stats = [
  { icon: <Trophy size={24} strokeWidth={1.5} />, iconLabel: "School building", value: "Be First", label: "Rate Your School" },
  { icon: <Banknote size={24} strokeWidth={1.5} />, iconLabel: "Military medal", value: "Free", label: "Always Free for Military Families" },
  { icon: <Timer size={24} strokeWidth={1.5} />, iconLabel: "Stopwatch", value: "5 min", label: "Average Time to Write a Review" },
];

const steps = [
  { icon: <Search size={36} strokeWidth={1.5} />, iconLabel: "Magnifying glass", step: "1", title: "Search by base or city", desc: "Find schools near your next duty station." },
  { icon: <BookOpen size={36} strokeWidth={1.5} />, iconLabel: "Open book", step: "2", title: "Read real family reviews", desc: "See ratings from families who've been there." },
  { icon: <PenLine size={36} strokeWidth={1.5} />, iconLabel: "Writing hand", step: "3", title: "Share your experience", desc: "Help the next family land on their feet." },
];

// CHANGE 5: Added accent color per dimension for left-border color coding
const dimensions = [
  { icon: <GraduationCap size={22} strokeWidth={1.5} />, iconLabel: "Books", name: "Academic Experience", desc: "Curriculum alignment, credit transfer, and course rigor.", accent: "#3B82F6" },
  { icon: <ClipboardList size={22} strokeWidth={1.5} />, iconLabel: "Clipboard", name: "Enrollment & Transition", desc: "How smoothly the school handled your PCS arrival.", accent: "#10B981" },
  { icon: <HandHeart size={22} strokeWidth={1.5} />, iconLabel: "Handshake", name: "Special Needs Support", desc: "IEP and 504 plan continuity after a move.", accent: "#8B5CF6" },
  { icon: <Users size={22} strokeWidth={1.5} />, iconLabel: "Heart", name: "Community & Belonging", desc: "How welcomed your child felt from day one.", accent: "#EF4444" },
  { icon: <Megaphone size={22} strokeWidth={1.5} />, iconLabel: "Megaphone", name: "Communication & Engagement", desc: "Teacher responsiveness and family involvement.", accent: "#F59E0B" },
  { icon: <Star size={22} strokeWidth={1.5} />, iconLabel: "Star", name: "Military-Family Fit", desc: "Overall support for the realities of military life.", accent: "#1D4ED8" },
];

export default function HomePage() {
  return (
    <div className="bg-[#F8F7F4]">

      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 flex flex-col items-center text-center gap-6">
          <div className="inline-block bg-[#E8A020] text-[#1B2A4A] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            Built by military families
          </div>

          {/* CHANGE 1: clamp() added for responsive H1 sizing */}
          <h1
            className="font-bold leading-tight max-w-3xl"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Find Schools that 
            Understand Military Life
          </h1>

          <p className="text-lg md:text-xl text-blue-200 max-w-2xl leading-relaxed">
            Peer reviews from military families who have made the same PCS moves.
            Real ratings. Real experiences. No guessing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-xl">
            <label htmlFor="hero-search" className="sr-only">
              Search by city, state, or base name
            </label>
            <input
              id="hero-search"
              type="text"
              placeholder="Search by city, state, or base name..."
              className="flex-1 rounded-lg px-4 py-3 text-white bg-transparent placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8A020] border border-blue-400"
            />
            <Link
              href="/schools"
              className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Find Schools
            </Link>
          </div>

          {/* CHANGE 2a: "Share your experience" → "Write a Review" */}
          <Link
            href="/review"
            className="border border-white text-white hover:bg-white hover:text-[#1B2A4A] px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Write a Review
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section aria-label="Site statistics" className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              {/* CHANGE 4: SVG icon rendered directly instead of emoji span */}
              <span aria-label={s.iconLabel} className="text-[#1B2A4A]">{s.icon}</span>
              <span className="text-2xl font-bold text-[#1B2A4A]">{s.value}</span>
              <span className="text-sm text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      {/* CHANGE 3: H2 already exists and is visible — confirmed, no change needed here */}
      <section aria-labelledby="how-it-works-heading" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="how-it-works-heading" className="text-2xl md:text-3xl font-bold text-[#1B2A4A] text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3"
            >
              {/* CHANGE 4: SVG icon rendered directly */}
              <span aria-label={s.iconLabel} className="text-[#1B2A4A]">{s.icon}</span>
              <div className="w-7 h-7 rounded-full bg-[#E8A020] text-[#1B2A4A] text-xs font-bold flex items-center justify-center" aria-hidden="true">
                {s.step}
              </div>
              <div className="font-semibold text-[#1B2A4A]">{s.title}</div>
              <p className="text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rating dimensions */}
      <section aria-labelledby="what-families-rate-heading" className="bg-white border-t border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="what-families-rate-heading" className="text-2xl md:text-3xl font-bold text-[#1B2A4A] text-center mb-2">
            What military families rate
          </h2>
          <p className="text-center text-slate-500 text-sm mb-10">
            Every review covers six dimensions that matter most during a PCS move.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {dimensions.map((d) => (
              // CHANGE 5: Left-border accent color + matching icon color per dimension
              <div
                key={d.name}
                className="rounded-xl border border-slate-200 p-5 flex gap-4 items-start bg-[#F8F7F4] hover:border-[#E8A020] transition-colors"
                style={{ borderLeft: `4px solid ${d.accent}` }}
              >
                {/* CHANGE 4: SVG icon with matching accent color */}
                <span
                  aria-label={d.iconLabel}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: d.accent }}
                >
                  {d.icon}
                </span>
                <div>
                  <div className="font-semibold text-[#1B2A4A] text-sm">{d.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community launch CTA */}
      <section aria-labelledby="community-heading" className="mx-auto max-w-6xl px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 md:p-14 flex flex-col items-center text-center gap-5">
          <span role="img" aria-label="Waving hand" className="text-5xl">👋</span>
          <h2 id="community-heading" className="text-2xl md:text-3xl font-bold text-[#1B2A4A] max-w-xl">
            Every great community starts with one voice.
          </h2>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
            We&apos;re just getting started — and that means your review carries more weight
            than it ever will again. If you&apos;ve PCS&apos;d recently, your experience is exactly
            what the next military family needs to find a school that truly supports their kids.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {/* CHANGE 2b: "Write the First Review" → "Write a Review" */}
            <Link
              href="/review"
              className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-8 py-4 rounded-lg text-sm transition-colors"
            >
              Write a Review
            </Link>
            {/* CHANGE 2c: "Browse Schools" → "Find Schools" */}
            <Link
              href="/schools"
              className="border border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white font-semibold px-8 py-4 rounded-lg text-sm transition-colors"
            >
              Find Schools
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 flex flex-col items-center text-center gap-6">
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl">
            Have you PCS&apos;d recently? Help the next family.
          </h2>
          <p className="text-blue-200 text-sm max-w-lg">
            Your review takes about 5 minutes and could save another military family weeks of uncertainty.
          </p>
          {/* CHANGE 2d: "Write a School Review" → "Write a Review" */}
          <Link
            href="/review"
            className="bg-[#E8A020] hover:bg-amber-500 text-[#1B2A4A] font-bold px-8 py-4 rounded-lg text-base transition-colors"
          >
            Write a Review
          </Link>
        </div>
      </section>

    </div>
  );
}
