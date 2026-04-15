import Atmosphere from "@/scene/elements/Atmosphere";
import HazeLayers from "@/scene/elements/HazeLayers";
import LightField from "@/scene/elements/LightField";
import TerrainForms from "@/scene/elements/TerrainForms";
import MarbleEnvironmentStage from "@/scene/future/MarbleEnvironmentStage";
import SparkSplatStage from "@/scene/future/SparkSplatStage";
import type { EnvironmentModule, EnvironmentRendererProps } from "@/scene/types";

function AbstractHighlandsEnvironment({ scrollProgress, reducedMotion, quality }: EnvironmentRendererProps) {
  return (
    <group position={[0, 0.1, -0.2]}>
      <Atmosphere reducedMotion={reducedMotion} />
      <HazeLayers reducedMotion={reducedMotion} />
      <TerrainForms scrollProgress={scrollProgress} quality={quality} />
      <LightField reducedMotion={reducedMotion} quality={quality} />

      <SparkSplatStage visible={false} />
      <MarbleEnvironmentStage visible={false} />
    </group>
  );
}

export const abstractHighlandsEnvironment: EnvironmentModule = {
  id: "abstract-highlands",
  label: "Abstract Highlands",
  Renderer: AbstractHighlandsEnvironment,
  anchors: [
    {
      id: "hero-primary",
      label: "Environment System",
      eyebrow: "Active mode",
      body: "Abstract Highlands is the current production-safe environment, keeping the experience atmospheric and asset-light.",
      position: [0.25, 0.72, -3.6],
      overlayOffset: [18, -12]
    },
    {
      id: "hero-secondary",
      label: "Upgrade path",
      eyebrow: "Next renderers",
      body: "Spark splats, Marble environments, and richer panel logic slot in through the same environment boundary.",
      href: "#experiments",
      position: [2.35, 0.18, -4.65],
      overlayOffset: [16, -8]
    }
  ]
};
