import type { SceneQuality } from "@/scene/systems/useSceneCapability";
import type { ComponentType } from "react";

export interface EnvironmentRendererProps {
  scrollProgress: number;
  reducedMotion: boolean;
  quality: SceneQuality;
  sparkSource?: SparkSplatSource;
  marbleSource?: MarbleEnvironmentSource;
}

export interface EnvironmentCameraProfile {
  basePosition: [number, number, number];
  wheelOffset: [number, number, number];
  lookTarget: [number, number, number];
  pointerScale: number;
}

export interface SparkSplatSource {
  kind: "spark-splat";
  sourceUrl: string;
  manifestUrl?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  opacity?: number;
}

export interface MarbleEnvironmentSource {
  kind: "marble-environment";
  sourceUrl: string;
  environmentId: string;
}

export interface WorldPanelAnchor {
  id: string;
  label: string;
  position: [number, number, number];
  eyebrow?: string;
  body?: string;
  href?: string;
  overlayOffset?: [number, number];
}

export interface EnvironmentModule {
  id: string;
  label: string;
  Renderer: ComponentType<EnvironmentRendererProps>;
  anchors?: WorldPanelAnchor[];
  camera?: Partial<EnvironmentCameraProfile>;
}

export interface HeroSceneConfig {
  activeEnvironmentId: string;
  sparkSource?: SparkSplatSource;
  marbleSource?: MarbleEnvironmentSource;
}
