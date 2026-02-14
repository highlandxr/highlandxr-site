import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Business | HighlandXR",
  description: "Submit a business for the Highlands XR portal."
};

export default function SubmitBusinessPage() {
  return (
    <div className="shell-container pb-20 pt-8 md:pt-10">
      <section className="surface-glass grid gap-4 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-subtle">Directory Intake</p>
        <h1 className="text-4xl md:text-5xl">Add a business</h1>
        <p className="max-w-2xl">
          Submit a Highlands-based business, studio, or organisation working in XR. Include a short description, location, and website.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="https://example.org/highlandxr-directory-submit" className="btn btn-primary">
            Open business form
          </a>
          <a href="mailto:info@highlandxr.com?subject=HighlandXR%20Business%20Submission" className="btn btn-secondary">
            Email submission
          </a>
        </div>
      </section>
    </div>
  );
}
