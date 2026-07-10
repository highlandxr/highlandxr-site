import { Link } from "react-router-dom";

interface PageBrandProps {
  section: string;
}

export default function PageBrand({ section }: PageBrandProps) {
  return (
    <Link to="/" className="page-brand" aria-label={`Highland XR | ${section}`}>
      <span className="page-brand__name">
        Highland <span>XR</span>
      </span>
      <span className="page-brand__divider" aria-hidden="true">|</span>
      <span className="page-brand__section">{section}</span>
    </Link>
  );
}
