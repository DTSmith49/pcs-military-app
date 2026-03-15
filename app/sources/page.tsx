import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sources & Attributions | PCS Parent SchoolGuide",
  description: "Data sources, tools, and attributions used to build the PCS Parent SchoolGuide.",
};

const sources = [
  {
    category: "School Data",
    items: [
      {
        name: "National Center for Education Statistics (NCES) — Common Core of Data",
        url: "https://nces.ed.gov/ccd/",
        description:
          "Public school names, addresses, grade ranges, enrollment figures, and locale codes (urban/suburban/rural) used throughout the school directory.",
      },
      {
        name: "GreatSchools",
        url: "https://www.greatschools.org",
        description:
          "Supplementary school summary ratings and student-body demographics referenced in school detail views.",
      },
    ],
  },
  {
    category: "Military Installation Data",
    items: [
      {
        name: "Defense Installations Spatial Data Infrastructure (DISDI)",
        url: "https://www.acq.osd.mil/eie/BSI/BEI_DISDI.html",
        description:
          "Installation names, locations, and branch-of-service information used to associate schools with nearby bases.",
      },
      {
        name: "Military OneSource",
        url: "https://www.militaryonesource.mil",
        description:
          "General PCS guidance and resource links referenced in onboarding copy.",
      },
    ],
  },
  {
    category: "Mapping & Geocoding",
    items: [
      {
        name: "OpenStreetMap contributors",
        url: "https://www.openstreetmap.org/copyright",
        description:
          "Base map tiles and geographic boundary data. © OpenStreetMap contributors, licensed under ODbL.",
      },
      {
        name: "Nominatim Geocoding Service",
        url: "https://nominatim.openstreetmap.org",
        description:
          "Address-to-coordinate lookups for school and installation pins.",
      },
    ],
  },
  {
    category: "Rating Methodology",
    items: [
      {
        name: "PCS Parent SchoolGuide Rating System",
        url: "https://www.notion.so/PCS-School-Rating-System-29a4c4a33e58803681c8cabfdd8df884",
        description:
          "Internal documentation describing how community survey responses are weighted and aggregated into the Overall School Score shown on each school profile.",
      },
    ],
  },
  {
    category: "Open-Source Libraries & Tools",
    items: [
      {
        name: "Next.js",
        url: "https://nextjs.org",
        description: "React framework powering the app. MIT License.",
      },
      {
        name: "Tailwind CSS",
        url: "https://tailwindcss.com",
        description: "Utility-first CSS framework used for all styling. MIT License.",
      },
      {
        name: "Supabase",
        url: "https://supabase.com",
        description: "Open-source backend for authentication, database, and storage.",
      },
      {
        name: "Lucide React",
        url: "https://lucide.dev",
        description: "Icon library used throughout the UI. ISC License.",
      },
    ],
  },
];

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Sources &amp; Attributions</h1>
        <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
          PCS Parent SchoolGuide is built on publicly available data, open-source software, and the
          lived experiences of military families. We believe in full transparency about where our
          information comes from.
        </p>
      </div>

      <div className="space-y-10">
        {sources.map((section) => (
          <section key={section.category}>
            <h2 className="text-lg font-semibold text-slate-800 uppercase tracking-wide mb-4 border-b border-slate-200 pb-2">
              {section.category}
            </h2>
            <ul className="space-y-5">
              {section.items.map((item) => (
                <li key={item.name} className="flex flex-col gap-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {item.name} ↗
                  </a>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6">
        <h2 className="text-base font-semibold text-blue-900 mb-2">Something missing or incorrect?</h2>
        <p className="text-sm text-blue-800 leading-relaxed">
          If you notice an attribution error or would like to request removal of data related to
          your school, please reach out via the feedback form on the{" "}
          <a href="/" className="underline hover:text-blue-600">
            home page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
