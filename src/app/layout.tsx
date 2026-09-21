import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { catalogV2Enabled } from "@/lib/flags";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], weight: ["400", "500", "600"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "holidayz.vip", template: "%s · holidayz.vip" },
  description: "Culturally competent holiday kits for families with teens. Winter Light, Whole Table, and Wellness Season.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const v2 = catalogV2Enabled();
  return (
    <html lang="en" className={`${archivo.variable} ${newsreader.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-card focus:px-3 focus:py-2 focus:rounded">
          Skip to content
        </a>
        <header className="border-b border-border">
          <nav aria-label="Primary" className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="font-semibold text-lg tracking-[.08em] font-mono">HOLIDAYZ<span className="text-gold">.VIP</span></Link>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <li><Link href="/#kit" className="hover:text-foreground">Winter Light</Link></li>
              {v2 && (
                <>
                  <li><Link href="/whole-table" className="hover:text-foreground">Whole Table</Link></li>
                  <li><Link href="/wellness-season" className="hover:text-foreground">Wellness Season</Link></li>
                  <li><Link href="/lens/affirming" className="hover:text-foreground">Affirming lens</Link></li>
                </>
              )}
            </ul>
          </nav>
        </header>
        <main id="main" className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-border mt-12">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted flex flex-wrap gap-x-6 gap-y-2">
            <span>Altered Earth Press · US-Squared Research Institute</span>
            {v2 && <Link href="/community-builders" className="hover:text-foreground">Community builders</Link>}
            <a href="mailto:hello@us-squared.org" className="hover:text-foreground">hello@us-squared.org</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
