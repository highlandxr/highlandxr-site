import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="shell-container pb-24 pt-24 md:pt-28">
      <section className="legacy-shell">
        <p className="eyebrow">404</p>
        <h1 className="section-title">Page not found.</h1>
        <p>The route you requested is not part of the current HighlandXR site map.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="button button-primary">
            Back to homepage
          </Link>
          <Link to="/businesses" className="button button-ghost">
            Browse archive
          </Link>
        </div>
      </section>
    </div>
  );
}
