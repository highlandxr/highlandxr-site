import Atmosphere from "@/scene/elements/Atmosphere";
import HazeLayers from "@/scene/elements/HazeLayers";
import LightField from "@/scene/elements/LightField";
import TerrainForms from "@/scene/elements/TerrainForms";
import SparkSplatStage from "@/scene/future/SparkSplatStage";
import type { EnvironmentModule, EnvironmentRendererProps } from "@/scene/types";

function SparkPreviewEnvironment({ scrollProgress, reducedMotion, quality, sparkSource }: EnvironmentRendererProps) {
  return (
    <group position={[0, 0.1, -0.2]}>
      <Atmosphere reducedMotion={reducedMotion} />
      <HazeLayers reducedMotion={reducedMotion} />
      <TerrainForms scrollProgress={scrollProgress} quality={quality} />
      <LightField reducedMotion={reducedMotion} quality={quality} />
      <SparkSplatStage source={sparkSource} visible />
    </group>
  );
}

export const sparkPreviewEnvironment: EnvironmentModule = {
  id: "spark-preview",
  label: "Spark Preview",
  Renderer: SparkPreviewEnvironment,
  anchors: [
    {
      id: "spark-focus",
      label: "Spark preview",
      eyebrow: "Splat source",
      body: "A lightweight manifest-backed splat proxy proves the environment adapter flow before the real Spark runtime is connected.",
      position: [0.1, 0.25, -4.8],
      overlayOffset: [20, -4]
    },
    {
      id: "spark-notes",
      label: "Asset handoff",
      eyebrow: "Pipeline",
      body: "Swap the preview manifest for a real Spark scene source and keep the rest of the site untouched.",
      position: [2.4, -0.2, -5.4],
      overlayOffset: [18, -6]
    }
  ]
};
