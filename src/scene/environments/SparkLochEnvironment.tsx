import SparkSplatStage from "@/scene/future/SparkSplatStage";
import GrassParticles from "@/scene/elements/GrassParticles";
import type { EnvironmentModule, EnvironmentRendererProps } from "@/scene/types";

function SparkLochEnvironment({ quality, reducedMotion, sparkSource }: EnvironmentRendererProps) {
  return (
    <group>
      <SparkSplatStage source={sparkSource} quality={quality} visible />
      <GrassParticles quality={quality} reducedMotion={reducedMotion} />
    </group>
  );
}

export const sparkLochEnvironment: EnvironmentModule = {
  id: "spark-loch",
  label: "Spark Loch",
  Renderer: SparkLochEnvironment,
  anchors: [],
  camera: {
    basePosition: [0, 1.45, 0.25],
    wheelOffset: [0, 0.06, 0.28],
    lookTarget: [0, 1.35, -6],
    pointerScale: 0.04
  }
};
