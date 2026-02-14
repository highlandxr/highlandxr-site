import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

export const metadata: Metadata = {
  title: "HighlandXR",
  description: "Premium XR portal for the Scottish Highlands: events, businesses, and immersive opportunities.",
  metadataBase: new URL("https://highlandxr.com")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body`}>
        <a
          href="#main-content"
          className="absolute left-3 top-[-70px] z-50 rounded-pill border border-white/25 bg-surface-panel px-3 py-2 text-sm text-text-base no-underline transition-all duration-200 focus:top-3"
        >
          Skip to content
        </a>

        <div className="relative z-10 grid min-h-screen grid-rows-[auto_1fr_auto]">
          <header className="border-b border-white/10 bg-surface-deep/70 backdrop-blur-xl">
            <div className="shell-container flex flex-wrap items-center gap-3 py-4">
              <Link href="/" className="btn btn-ghost px-4 py-2" aria-label="Home">
                Home
              </Link>

              <Link href="/" className="inline-flex items-center gap-2 text-text-base no-underline" aria-label="HighlandXR home">
                <span
                  aria-hidden
                  className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-brand-aurora to-brand-violet shadow-[0_0_18px_rgba(92,227,215,0.45)]"
                />
                <span className="font-heading text-lg tracking-wide">Highland XR</span>
              </Link>

              <nav className="ml-auto">
                <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-sm">
                  <li>
                    <Link
                      href="/#immersive-screens"
                      className="rounded-pill border border-transparent px-3 py-1.5 no-underline hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      Screens
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#filters"
                      className="rounded-pill border border-transparent px-3 py-1.5 no-underline hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      Filters
                    </Link>
                  </li>
                  <li>
                    <Link href="/submit-event" className="rounded-pill border border-transparent px-3 py-1.5 no-underline hover:border-white/20 hover:bg-white/[0.04]">
                      Submit event
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/submit-business"
                      className="rounded-pill border border-transparent px-3 py-1.5 no-underline hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      Add business
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

          <main id="main-content">{children}</main>

          <footer className="border-t border-white/10 bg-surface-charcoal/65">
            <div className="shell-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-text-subtle">
              <p>Highland XR Portal</p>
              <a href="mailto:info@highlandxr.com" className="no-underline">
                info@highlandxr.com
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
