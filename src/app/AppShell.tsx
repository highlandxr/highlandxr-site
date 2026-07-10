import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { siteConfig } from "@/app/site";
import PageBrand from "@/components/PageBrand";

interface AppShellProps {
  children: ReactNode;
}

const primaryLinks = [
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Experiments", href: "/#experiments" },
  { label: "Contact", href: "/#contact" }
];

function getPageSection(pathname: string) {
  if (pathname === "/businesses") return "Directory";
  if (pathname === "/events") return "Events";
  if (pathname === "/submit-event") return "Submit event";
  if (pathname === "/submit-business") return "Submit business";
  if (pathname.startsWith("/items/")) return "Listing";
  return "Explore";
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isImmersiveHome = location.pathname === "/";
  const hasLandscapeHeader = location.pathname === "/businesses";
  const pageSection = getPageSection(location.pathname);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="site-frame">
        {!isImmersiveHome ? (
          <header className={`site-header${hasLandscapeHeader ? " site-header--overlay" : ""}`}>
            <div className="shell-container flex items-center gap-4 py-5">
              <PageBrand section={pageSection} />

              <nav className="ml-auto hidden items-center gap-2 text-sm md:flex" aria-label="Primary">
                {primaryLinks.map((link) => (
                  <a key={link.href} href={link.href} className="nav-pill">
                    {link.label}
                  </a>
                ))}
                <a href={`mailto:${siteConfig.email}`} className="button button-primary ml-2">
                  Start a conversation
                </a>
              </nav>

              <div className="ml-auto md:hidden">
                <a href={`mailto:${siteConfig.email}`} className="button button-primary button-compact">
                  Contact
                </a>
              </div>
            </div>
          </header>
        ) : null}

        <main id="main-content">{children}</main>

        {!isImmersiveHome ? (
          <footer className="site-footer">
            <div className="shell-container grid gap-8 py-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <div className="grid gap-3">
                <p className="eyebrow">HighlandXR</p>
                <h2 className="max-w-md text-2xl font-semibold text-text-base">{siteConfig.tagline}</h2>
                <p className="max-w-lg">
                  Phase 1 establishes the company site, abstract environment system, and HTML-first foundation for later Spark
                  and Marble-powered worlds.
                </p>
              </div>

              <div className="grid gap-3">
                <p className="eyebrow">Navigate</p>
                <div className="grid gap-2 text-sm">
                  {primaryLinks.map((link) => (
                    <a key={link.href} href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  ))}
                  <a href={`mailto:${siteConfig.email}`} className="footer-link">
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              <div className="grid gap-3">
                <p className="eyebrow">Archive</p>
                <div className="grid gap-2 text-sm">
                  {siteConfig.legacyLinks.map((link) => (
                    <NavLink key={link.href} to={link.href} className="footer-link">
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        ) : null}
      </div>
    </>
  );
}
