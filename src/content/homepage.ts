export interface Capability {
  title: string;
  body: string;
}

export interface FeaturedWorkEntry {
  title: string;
  summary: string;
  location: string;
  signal: string;
  href: string;
  tags: string[];
}

export const homeContent = {
  hero: {
    eyebrow: "Spatial Studio",
    title: "Immersive environments for the Highlands and beyond.",
    accent: "built for the web",
    body:
      "HighlandXR shapes spatial experiences, prototype worlds, and immersive web surfaces that feel deliberate, cinematic, and ready to evolve into true 3D environments.",
    primaryCta: {
      label: "Start a project",
      href: "mailto:info@highlandxr.com?subject=HighlandXR%20Project%20Enquiry"
    },
    secondaryCta: {
      label: "Explore capabilities",
      href: "#capabilities"
    },
    annotation: "Phase 1 lays the HTML-first foundation for future Spark splats, Marble environments, and in-world UI."
  },
  whatWeDo: {
    eyebrow: "What HighlandXR does",
    title: "Spatial strategy, immersive surfaces, and scene-ready systems.",
    body:
      "We design spatial products that start as robust websites and evolve toward inhabitable environments. The work spans narrative direction, interaction systems, worldbuilding, and technical delivery built for real devices and real audiences.",
    highlights: [
      "HTML-first architecture so the experience remains crawlable, fast, and accessible before the heavier 3D layers arrive.",
      "Scene systems designed for upgrade paths: abstract environments now, splats and authored worlds when the asset pipeline is ready.",
      "A studio posture that balances premium visual direction with maintainable front-end engineering."
    ]
  },
  capabilities: [
    {
      title: "Spatial web experiences",
      body: "Landing experiences and product surfaces that translate brand intent into layered, immersive interfaces."
    },
    {
      title: "Environment prototyping",
      body: "Abstract or location-inspired worlds built to become future containers for splats, environments, and guided journeys."
    },
    {
      title: "Interaction systems",
      body: "Scroll, motion, and content choreography that feels calm and intentional instead of theatrical or game-like."
    },
    {
      title: "Technical direction",
      body: "Scene architecture, performance budgets, and integration plans for Spark, Marble, and later in-world UI."
    }
  ] satisfies Capability[],
  featuredWork: [
    {
      title: "Inverness Castle Experience",
      summary: "An immersive visitor attraction format built around Highland stories, multisensory interpretation, and spatial narrative.",
      location: "Inverness",
      signal: "Visitor attraction",
      href: "/items/inverness-castle-experience",
      tags: ["XR", "Immersive", "Tourism"]
    },
    {
      title: "Uist Unearthed (UHI NWH)",
      summary: "A location-aware archaeology project showing how digital place layers can connect landscape, research, and public interpretation.",
      location: "Benbecula",
      signal: "Location-aware storytelling",
      href: "/items/uist-unearthed-uhi",
      tags: ["AR", "XR", "Archaeology"]
    },
    {
      title: "West Highland Museum VR",
      summary: "A museum-led reconstruction project that demonstrates heritage storytelling through navigable historical space.",
      location: "Fort William",
      signal: "Heritage reconstruction",
      href: "/items/west-highland-museum-vr",
      tags: ["VR", "Heritage", "Museum"]
    }
  ] satisfies FeaturedWorkEntry[],
  contact: {
    eyebrow: "Contact",
    title: "Planning a spatial website, prototype world, or immersive pilot?",
    body: "HighlandXR is set up to take a conventional site and move it, deliberately, toward a richer 3D experience without losing clarity, speed, or maintainability.",
    cta: {
      label: "Email info@highlandxr.com",
      href: "mailto:info@highlandxr.com"
    }
  }
} as const;
