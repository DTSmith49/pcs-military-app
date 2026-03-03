// app/page.tsx
import Link from "next/link";
import { heroCopy, howRatingsWork, privacyCopy } from "@/content/siteCopy";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      {/* Hero section */}
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">{heroCopy.headline}</h1>
        <p className="text-lg text-slate-700">{heroCopy.subheadline}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/schools"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            {heroCopy.primaryCtaLabel}
          </Link>
          <Link
            href="/review"
            className="rounded border border-blue-600 px-4 py-2 text-blue-600"
          >
            {heroCopy.secondaryCtaLabel}
          </Link>
        </div>
      </section>

      {/* How ratings work */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">{howRatingsWork.title}</h2>
        {howRatingsWork.paragraphs.map((p) => (
          <p key={p} className="text-slate-700">
            {p}
          </p>
        ))}
        <ul className="list-disc pl-6 space-y-1">
          {howRatingsWork.bullets.map((b) => (
            <li key={b} className="text-slate-700">
              {b}
            </li>
          ))}
        </ul>
        <p className="text-slate-700">{howRatingsWork.closing}</p>
      </section>

      {/* Privacy and limitations */}
      <section className="space-y-3 border-t border-slate-200 pt-6">
        <h2 className="text-2xl font-semibold">{privacyCopy.title}</h2>
        {privacyCopy.paragraphs.map((p) => (
          <p key={p} className="text-slate-700">
            {p}
          </p>
        ))}
      </section>
    </main>
  );
}
