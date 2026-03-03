// components/PrivacyNotice.tsx
import { privacyCopy } from "@/content/siteCopy";

export function PrivacyNotice() {
  return (
    <aside className="mb-6 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <h2 className="mb-2 text-base font-semibold">{privacyCopy.title}</h2>
      {privacyCopy.paragraphs.map((p) => (
        <p key={p} className="mb-2 last:mb-0">
          {p}
        </p>
      ))}
    </aside>
  );
}
