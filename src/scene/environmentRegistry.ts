import { heroSceneConfig } from "@/content/heroScene";
import { abstractHighlandsEnvironment } from "@/scene/environments/AbstractHighlandsEnvironment";
import { marblePreviewEnvironment } from "@/scene/environments/MarblePreviewEnvironment";
import { sparkLochEnvironment } from "@/scene/environments/SparkLochEnvironment";
import { sparkPreviewEnvironment } from "@/scene/environments/SparkPreviewEnvironment";
import type { EnvironmentModule, HeroSceneConfig } from "@/scene/types";

const environmentModules: Record<string, EnvironmentModule> = {
  [abstractHighlandsEnvironment.id]: abstractHighlandsEnvironment,
  [sparkLochEnvironment.id]: sparkLochEnvironment,
  [sparkPreviewEnvironment.id]: sparkPreviewEnvironment,
  [marblePreviewEnvironment.id]: marblePreviewEnvironment
};

export function listHeroEnvironments() {
  return Object.values(environmentModules);
}

export function resolveHeroEnvironment(config: HeroSceneConfig = heroSceneConfig) {
  return environmentModules[config.activeEnvironmentId] ?? abstractHighlandsEnvironment;
}
