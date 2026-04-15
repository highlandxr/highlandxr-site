import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { homeContent } from "@/content/homepage";
import { useHeroScrollProgress } from "@/motion/useHeroScrollProgress";
import type { SceneViewportProps } from "@/scene/core/SceneViewport";
import { canAttemptSceneRender } from "@/scene/systems/useSceneCapability";

export default function HomeHero() {
  const scrollProgress = useHeroScrollProgress();
  const [SceneViewport, setSceneViewport] = useState<ComponentType<SceneViewportProps> | null>(null);

  useEffect(() => {
    let active = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canAttemptSceneRender(reducedMotion)) {
      return () => {
        active = false;
      };
    }

    const loadScene = () => {
      import("@/scene/core/SceneViewport").then((module) => {
        if (active) {
          setSceneViewport(() => module.default);
        }
      });
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadScene, { timeout: 900 });

      return () => {
        active = false;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = setTimeout(loadScene, 280);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="hero-shell">
      <div className="hero-backdrop" aria-hidden />
      {SceneViewport ? <SceneViewport scrollProgress={scrollProgress} /> : null}

      <div className="shell-container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{homeContent.hero.eyebrow}</p>
          <h1 className="hero-title">
            {homeContent.hero.title}
            <span className="hero-title__accent">{homeContent.hero.accent}</span>
          </h1>
          <p className="hero-body">{homeContent.hero.body}</p>

          <div className="flex flex-wrap gap-3">
            <a href={homeContent.hero.primaryCta.href} className="button button-primary">
              {homeContent.hero.primaryCta.label}
            </a>
            <a href={homeContent.hero.secondaryCta.href} className="button button-secondary">
              {homeContent.hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <aside className="hero-aside">
          <p className="hero-aside__label">Spatial direction</p>
          <p className="hero-aside__copy">{homeContent.hero.annotation}</p>
        </aside>
      </div>
    </section>
  );
}
