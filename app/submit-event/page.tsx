import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Event | HighlandXR",
  description: "Submit a Highlands XR event for review."
};

export default function SubmitEventPage() {
  return (
    <div className="shell-container pb-20 pt-8 md:pt-10">
      <section className="surface-glass grid gap-4 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-subtle">Contribute</p>
        <h1 className="text-4xl md:text-5xl">Submit an event</h1>
        <p className="max-w-2xl">
          Share your event with Highland XR. Use the form link below or send details by email for manual review.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="https://example.org/highlandxr-submit" className="btn btn-primary">
            Open event form
          </a>
          <a href="mailto:info@highlandxr.com?subject=HighlandXR%20Event%20Submission" className="btn btn-secondary">
            Email submission
          </a>
        </div>
      </section>
    </div>
  );
}
