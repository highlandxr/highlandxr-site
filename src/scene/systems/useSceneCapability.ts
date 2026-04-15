import { useEffect, useState } from "react";

export type SceneQuality = "low" | "medium" | "high";

export interface SceneCapabilityProfile {
  shouldLoad: boolean;
  quality: SceneQuality;
}

function getNetworkInfo() {
  return navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
    };
    deviceMemory?: number;
  };
}

export function getSceneCapabilityProfile(reducedMotion: boolean): SceneCapabilityProfile {
  const nav = getNetworkInfo();
  const effectiveType = nav.connection?.effectiveType ?? "";
  const saveData = nav.connection?.saveData ?? false;
  const deviceMemory = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const width = window.innerWidth;
  const prefersFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (reducedMotion || saveData || effectiveType.includes("2g") || deviceMemory <= 2 || cores <= 2 || width < 700) {
    return { shouldLoad: false, quality: "low" };
  }

  if (effectiveType.includes("3g") || deviceMemory <= 4 || cores <= 4 || width < 1100 || !prefersFinePointer) {
    return { shouldLoad: true, quality: "low" };
  }

  if (deviceMemory <= 6 || cores <= 6 || width < 1440) {
    return { shouldLoad: true, quality: "medium" };
  }

  return { shouldLoad: true, quality: "high" };
}

export function canAttemptSceneRender(reducedMotion: boolean) {
  return getSceneCapabilityProfile(reducedMotion).shouldLoad;
}

export function useSceneCapability(reducedMotion: boolean) {
  const [profile, setProfile] = useState<SceneCapabilityProfile>({ shouldLoad: false, quality: "low" });

  useEffect(() => {
    setProfile(getSceneCapabilityProfile(reducedMotion));
  }, [reducedMotion]);

  return profile;
}
