import Atmosphere from "@/scene/elements/Atmosphere";
import HazeLayers from "@/scene/elements/HazeLayers";
import LightField from "@/scene/elements/LightField";
import MarbleEnvironmentStage from "@/scene/future/MarbleEnvironmentStage";
import TerrainForms from "@/scene/elements/TerrainForms";
import type { EnvironmentModule, EnvironmentRendererProps } from "@/scene/types";

function MarblePreviewEnvironment({ scrollProgress, reducedMotion, quality, marbleSource }: EnvironmentRendererProps) {
  return (
    <group position={[0, 0.1, -0.2]}>
      <Atmosphere reducedMotion={reducedMotion} />
      <HazeLayers reducedMotion={reducedMotion} />
      <TerrainForms scrollProgress={scrollProgress} quality={quality} />
      <LightField reducedMotion={reducedMotion} quality={quality} />
      <MarbleEnvironmentStage source={marbleSource} visible />
    </group>
  );
}

export const marblePreviewEnvironment: EnvironmentModule = {
  id: "marble-preview",
  label: "Marble Preview",
  Renderer: MarblePreviewEnvironment,
  anchors: [
    {
      id: "marble-gateway",
      label: "Marble preview",
      eyebrow: "Authored world",
      body: "A future environment can replace the procedural shell with authored spaces without changing the page structure.",
      position: [0, 0.65, -6.8],
      overlayOffset: [12, -10]
    },
    {
      id: "marble-sidebar",
      label: "Panel anchor",
      eyebrow: "Spatial UI",
      body: "These anchors become attachment points for future DOM-mapped panels, guided markers, or story layers.",
      position: [2.2, 0, -5.8],
      overlayOffset: [16, -4]
    }
  ]
};
