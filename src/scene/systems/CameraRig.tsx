import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";

interface CameraRigProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

export default function CameraRig({ scrollProgress, reducedMotion }: CameraRigProps) {
  const lookTarget = useMemo(() => new Vector3(0, -0.45, -8), []);

  useFrame((state) => {
    const targetY = reducedMotion ? 0.82 : 0.85 - scrollProgress * 0.55;
    const targetZ = reducedMotion ? 7.8 : 7.8 - scrollProgress * 0.7;
    const pointerOffsetX = reducedMotion ? 0 : state.pointer.x * 0.18;

    state.camera.position.x += (pointerOffsetX - state.camera.position.x) * 0.035;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.04;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.04;
    state.camera.lookAt(lookTarget);
  });

  return null;
}
