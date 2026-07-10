import { Link } from "react-router-dom";
import PageBrand from "@/components/PageBrand";
import Reveal from "@/motion/Reveal";

const capabilities = [
  ["01", "Discover", "Find people, projects and places shaping immersive work across the Highlands.", "/businesses"],
  ["02", "Connect", "Bring creative, cultural, technical and tourism voices into the same conversation.", "mailto:info@highlandxr.com"],
  ["03", "Make", "Turn strong Highland stories into virtual, augmented and spatial experiences.", "#connect"]
];

const signals = [
  ["Inverness", "Immersive heritage"],
  ["Uist", "Location-aware stories"],
  ["Fort William", "Virtual reconstruction"]
];

export default function HomeHero() {
  return (
    <div className="home-page">
      <div className="home-landscape" aria-hidden />
      <section className="hero-shell hero-shell--immersive" aria-labelledby="home-title">
        <div className="hero-backdrop" aria-hidden />

        <header className="home-header">
          <PageBrand section="Home" />
          <nav className="home-nav" aria-label="Primary">
            <a href="#about">About</a>
            <a href="#explore">Explore</a>
            <a href="#connect">Connect</a>
          </nav>
          <a className="home-contact" href="mailto:info@highlandxr.com">Get involved <span aria-hidden>↗</span></a>
        </header>

        <div className="hero-grid home-hero__inner">
          <div className="home-hero__copy">
            <p className="home-kicker"><span /> Highlands, Scotland</p>
            <h1 id="home-title">Immersive<br />begins <em>here.</em></h1>
            <p className="home-hero__lede">A new home for extended reality in the Scottish Highlands: a place to discover bold work, meet the people making it, and imagine what comes next.</p>
            <div className="home-hero__actions">
              <a className="home-button home-button--primary" href="#explore">Explore the network <span aria-hidden>↓</span></a>
              <a className="home-text-link" href="mailto:info@highlandxr.com">Start a conversation <span aria-hidden>↗</span></a>
            </div>
          </div>
          <aside className="home-hero__note">
            <span className="home-hero__note-label">Now mapping</span>
            <strong>XR across the<br />Highlands &amp; Islands</strong>
            <span className="home-hero__note-rule" />
            <span>Stories, spaces and new ways to experience place.</span>
          </aside>
        </div>
        <a className="hero-scroll-cue" href="#about"><span /> Scroll to explore</a>
      </section>

      <section id="about" className="home-intro section-wrap">
        <Reveal className="shell-container home-intro__grid">
          <p className="section-index">01 / THE NETWORK</p>
          <div>
            <p className="eyebrow">Rooted in place. Open to possibility.</p>
            <h2>Big experiences<br />from <em>wide horizons.</em></h2>
          </div>
          <div className="home-intro__body">
            <p>The Highlands has always carried stories further than its roads. HighlandXR connects the region’s makers, cultural organisations, educators and innovators using immersive technology to tell the next chapter.</p>
            <a className="home-text-link" href="#connect">Why HighlandXR <span aria-hidden>↓</span></a>
          </div>
        </Reveal>
      </section>

      <section id="explore" className="home-capabilities">
        <div className="shell-container">
          <Reveal className="home-capabilities__heading">
            <p className="section-index">02 / WHAT’S HERE</p>
            <h2>A living field<br />of <em>possibility.</em></h2>
            <p>From virtual reconstructions to augmented trails, this is a growing picture of the region’s immersive energy.</p>
          </Reveal>
          <div className="capability-list">
            {capabilities.map(([number, title, description, href]) => (
              <Reveal className="capability-item group" key={title}>
                <a className="capability-item__link" href={href}>
                  <span className="capability-item__number">{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="capability-item__arrow" aria-hidden>↗</span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal className="home-directory-link">
            <div><p className="eyebrow">The directory</p><strong>See who’s shaping immersive experiences in the Highlands.</strong></div>
            <Link to="/businesses" className="home-button home-button--outline">Browse the directory <span aria-hidden>↗</span></Link>
          </Reveal>
        </div>
      </section>

      <section className="home-signals section-wrap">
        <Reveal className="shell-container">
          <div className="home-signals__top"><p className="section-index">03 / FROM THE HIGHLANDS</p><p>Selected signals from a region in motion.</p></div>
          <div className="home-signals__visual" aria-hidden />
          <div className="home-signals__list">
            {signals.map(([place, type], index) => <Link to="/businesses" className="signal-link group" key={place}><span>0{index + 1}</span><strong>{place}</strong><em>{type}</em><b aria-hidden>↗</b></Link>)}
          </div>
        </Reveal>
      </section>

      <section id="connect" className="home-contact-section">
        <Reveal className="shell-container home-contact-section__inner">
          <p className="eyebrow">Bring your idea into view</p>
          <h2>The Highlands<br />are <em>only the start.</em></h2>
          <p>Have a project, event or experience that belongs on the map?<br />We’d love to hear from you.</p>
          <a className="home-button home-button--primary" href="mailto:info@highlandxr.com">Get in touch <span aria-hidden>↗</span></a>
        </Reveal>
      </section>

      <footer className="home-footer shell-container">
        <Link to="/" className="home-brand"><span>Highland <span>XR</span></span></Link>
        <p>Immersive Scotland, from the Highlands out.</p>
        <div><Link to="/events">Events</Link><Link to="/businesses">Directory</Link><a href="mailto:info@highlandxr.com">Email</a></div>
      </footer>
    </div>
  );
}
