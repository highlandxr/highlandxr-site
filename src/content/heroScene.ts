import type { HeroSceneConfig } from "@/scene/types";

export const heroSceneConfig: HeroSceneConfig = {
  activeEnvironmentId: "abstract-highlands",
  sparkSource: {
    kind: "spark-splat",
    sourceUrl: "/future/splats/project-scottish-highlands-loch-panorama.spz",
    position: [0, 1.4, 0],
    rotation: [0, Math.PI, 0],
    scale: 2.27
  },
  marbleSource: {
    kind: "marble-environment",
    sourceUrl: "/future/marble/highlandxr-lab.glb",
    environmentId: "highlandxr-lab"
  }
};
