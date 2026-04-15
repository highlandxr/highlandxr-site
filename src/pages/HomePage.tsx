import Reveal from "@/motion/Reveal";
import SectionHeading from "@/components/SectionHeading";
import HomeHero from "@/components/home/HomeHero";
import { homeContent } from "@/content/homepage";

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <div className="shell-container pb-24">
        <Reveal className="section-wrap" id="what-we-do">
          <SectionHeading
            eyebrow={homeContent.whatWeDo.eyebrow}
            title={homeContent.whatWeDo.title}
            body={homeContent.whatWeDo.body}
          />

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rich-copy">
              {homeContent.whatWeDo.highlights.map((highlight) => (
                <p key={highlight}>{highlight}</p>
              ))}
            </div>

            <div className="quiet-panel">
              <p className="eyebrow">Current posture</p>
              <p className="text-xl font-semibold text-text-base">Immersive lab energy with production-grade front-end discipline.</p>
              <p>
                The site behaves like a real company website first, while the scene layer is already structured to become a richer
                3D environment later.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="section-wrap" id="capabilities">
          <SectionHeading eyebrow="Services / capabilities" title="Designed to move from polished site to spatial environment." />

          <div className="grid gap-5 md:grid-cols-2">
            {homeContent.capabilities.map((capability) => (
              <article key={capability.title} className="capability-row">
                <h3 className="text-2xl font-semibold text-text-base">{capability.title}</h3>
                <p>{capability.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section-wrap" id="experiments">
          <SectionHeading
            eyebrow="Featured work / proof"
            title="Signals from real Highland immersive work."
            body="The company direction is grounded in live visitor, heritage, and location-aware projects already happening across the Highlands and Islands."
          />

          <div className="grid gap-4">
            {homeContent.featuredWork.map((entry) => (
              <article key={entry.title} className="proof-row">
                <div className="grid gap-1">
                  <p className="eyebrow text-brand-loch">{entry.signal}</p>
                  <h3 className="text-2xl font-semibold text-text-base">{entry.title}</h3>
                  <p className="text-sm uppercase tracking-[0.18em] text-text-subtle">{entry.location}</p>
                </div>
                <p>{entry.summary}</p>
                <div className="grid gap-3 justify-self-start md:justify-self-end">
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span key={`${entry.title}-${tag}`} className="legacy-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a href={entry.href} className="button button-ghost button-compact">
                    Open archive reference
                  </a>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="section-wrap" id="contact">
          <section className="contact-band">
            <SectionHeading eyebrow={homeContent.contact.eyebrow} title={homeContent.contact.title} body={homeContent.contact.body} />
            <div className="flex flex-wrap gap-3">
              <a href={homeContent.contact.cta.href} className="button button-primary">
                {homeContent.contact.cta.label}
              </a>
              <a href="/businesses" className="button button-ghost">
                View legacy archive
              </a>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}
