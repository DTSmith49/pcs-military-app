import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavClient from "@/components/NavClient"; // ADD THIS
import Script from "next/script";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PCS Parent SchoolGuide",
  description: "Schools rated by military families.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans bg-white text-slate-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-[#1B2A4A] focus:font-semibold focus:px-4 focus:py-2 focus:rounded focus:shadow"
        >
          Skip to main content
        </a>

        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-xl tracking-tight">PCS Parent</span>
              <span className="text-slate-800 font-semibold text-xl tracking-tight">SchoolGuide</span>
            </Link>

            {/* REPLACED static nav with auth-aware NavClient */}
            <NavClient />
          </div>
        </header>

        <main id="main-content">{children}</main>

        <footer className="bg-slate-900 text-slate-300 mt-16">
          <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-white font-bold text-lg mb-2">PCS Parent SchoolGuide</div>
              <p className="text-sm text-slate-400 leading-relaxed">Schools rated by military families — for military families on the move.</p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="text-white font-semibold mb-1 text-sm uppercase tracking-wide">Navigate</div>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/schools" className="hover:text-white transition-colors">Find Schools</Link>
              <Link href="/review" className="hover:text-white transition-colors">Write a Review</Link>
              <Link href="/sources" className="hover:text-white transition-colors">Sources &amp; Attributions</Link>
            </div>
            <div>
              <div className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">About</div>
              <p className="text-sm text-slate-400 leading-relaxed">Built by military families who know how hard PCS season can be. Every review helps the next family land on their feet.</p>
            </div>
          </div>
          <div className="border-t border-slate-700 text-center py-4 text-xs text-slate-500">
            © {new Date().getFullYear()} PCS Parent SchoolGuide. Built for military families.
          </div>
        </footer>
       <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "vwaly7b95c");
          `}
        </Script>
      </body>
    </html>
  );
}


