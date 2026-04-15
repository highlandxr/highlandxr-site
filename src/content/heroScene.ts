import type { HeroSceneConfig } from "@/scene/types";

export const heroSceneConfig: HeroSceneConfig = {
  activeEnvironmentId: "abstract-highlands",
  sparkSource: {
    kind: "spark-splat",
    sourceUrl: "/future/splats/highlandxr-campus.splat",
    manifestUrl: "/future/splats/highlandxr-campus.json"
  },
  marbleSource: {
    kind: "marble-environment",
    sourceUrl: "/future/marble/highlandxr-lab.glb",
    environmentId: "highlandxr-lab"
  }
};
