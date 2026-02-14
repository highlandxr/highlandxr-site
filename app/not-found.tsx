import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="shell-container pb-20 pt-10">
      <section className="surface-glass grid gap-4 p-6 text-center md:p-8">
        <h1 className="text-4xl">Listing not found</h1>
        <p>The item you requested is not available in the current portal dataset.</p>
        <div>
          <Link href="/" className="btn btn-ghost">
            Return to portal
          </Link>
        </div>
      </section>
    </div>
  );
}
