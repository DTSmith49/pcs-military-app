// app/schools/page.tsx
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default async function SchoolsListPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  const { data: schools, error } = await supabase
    .from("schools")
    .select("id, name, city, state")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading schools", error);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">
        Schools reviewed by military families
      </h1>

      <p className="text-sm text-slate-700">
        These schools come from your Supabase database. As more reviews are
        added, you&apos;ll be able to surface PCS-specific ratings here.
      </p>

      <ul className="space-y-2">
        {(schools ?? []).map((school) => (
          <li
            key={school.id}
            className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium">{school.name}</div>
              <div className="text-xs text-slate-500">
                {school.city}, {school.state}
              </div>
            </div>
            <Link
              href={`/schools/${school.id}`}
              className="text-xs text-blue-600 underline"
            >
              View details
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
