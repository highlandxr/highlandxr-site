import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import type { EnvironmentCameraProfile } from "@/scene/types";

interface CameraRigProps {
  scrollProgress: number;
  reducedMotion: boolean;
  cameraProfile?: Partial<EnvironmentCameraProfile>;
}

const DEFAULT_CAMERA_PROFILE: EnvironmentCameraProfile = {
  basePosition: [0, 0.85, 7.8],
  wheelOffset: [0, -0.55, -0.7],
  lookTarget: [0, -0.45, -8],
  pointerScale: 0.18
};

export default function CameraRig({ scrollProgress, reducedMotion, cameraProfile }: CameraRigProps) {
  const profile = {
    basePosition: cameraProfile?.basePosition ?? DEFAULT_CAMERA_PROFILE.basePosition,
    wheelOffset: cameraProfile?.wheelOffset ?? DEFAULT_CAMERA_PROFILE.wheelOffset,
    lookTarget: cameraProfile?.lookTarget ?? DEFAULT_CAMERA_PROFILE.lookTarget,
    pointerScale: cameraProfile?.pointerScale ?? DEFAULT_CAMERA_PROFILE.pointerScale
  };
  const lookTarget = useMemo(
    () => new Vector3(profile.lookTarget[0], profile.lookTarget[1], profile.lookTarget[2]),
    [profile.lookTarget]
  );

  useFrame((state) => {
    const targetX = profile.basePosition[0] + (reducedMotion ? 0 : scrollProgress * profile.wheelOffset[0]);
    const targetY = profile.basePosition[1] + (reducedMotion ? 0 : scrollProgress * profile.wheelOffset[1]);
    const targetZ = profile.basePosition[2] + (reducedMotion ? 0 : scrollProgress * profile.wheelOffset[2]);
    const pointerOffsetX = targetX + (reducedMotion ? 0 : state.pointer.x * profile.pointerScale);

    state.camera.position.x += (pointerOffsetX - state.camera.position.x) * 0.035;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.04;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.04;
    state.camera.lookAt(lookTarget);
  });

  return null;
}
