import type { ReactNode } from "react";
import { Component, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/motion/usePrefersReducedMotion";
import { SceneCanvas } from "@/scene/core/SceneCanvas";
import { heroSceneConfig } from "@/content/heroScene";
import { resolveHeroEnvironment } from "@/scene/environmentRegistry";
import WorldPanelOverlay from "@/scene/future/WorldPanelOverlay";
import { useSceneCapability } from "@/scene/systems/useSceneCapability";
import { useSceneActivity } from "@/scene/systems/useSceneActivity";

export interface SceneViewportProps {
  scrollProgress: number;
  showOverlayPanels?: boolean;
}

interface SceneBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface SceneBoundaryState {
  hasError: boolean;
}

class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  override state: SceneBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function StaticAtmosphere() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 scene-overlay-noise opacity-40" />
      <div className="absolute left-[12%] top-[14%] h-40 w-40 rounded-full bg-brand-aurora/10 blur-3xl" />
      <div className="absolute right-[8%] top-[16%] h-36 w-36 rounded-full bg-brand-twilight/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-[-12%] h-[52%] bg-[radial-gradient(circle_at_50%_18%,rgba(125,232,217,0.12),transparent_44%),linear-gradient(180deg,rgba(3,5,7,0)_0%,rgba(3,5,7,0.86)_82%)]" />
    </div>
  );
}

export function SceneViewport({ scrollProgress, showOverlayPanels = true }: SceneViewportProps) {
  const reducedMotion = usePrefersReducedMotion();
  const capability = useSceneCapability(reducedMotion);
  const sceneActive = useSceneActivity(capability.shouldLoad);
  const environment = resolveHeroEnvironment(heroSceneConfig);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      <StaticAtmosphere />
      {showOverlayPanels ? (
        <WorldPanelOverlay anchors={environment.anchors} scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      ) : null}
      {mounted && capability.shouldLoad ? (
        <SceneBoundary fallback={<StaticAtmosphere />}>
          <SceneCanvas
            scrollProgress={scrollProgress}
            reducedMotion={reducedMotion}
            active={sceneActive}
            quality={capability.quality}
          />
        </SceneBoundary>
      ) : null}
    </div>
  );
}

export default SceneViewport;
