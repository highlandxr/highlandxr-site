import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import type { Group } from "three";

interface PointerDriftProps {
  target: MutableRefObject<Group | null>;
  reducedMotion: boolean;
}

export default function PointerDrift({ target, reducedMotion }: PointerDriftProps) {
  useFrame((state) => {
    if (!target.current) {
      return;
    }

    const driftX = reducedMotion ? 0 : state.pointer.x * 0.18;
    const driftY = reducedMotion ? 0 : state.pointer.y * 0.12;

    target.current.position.x += (driftX - target.current.position.x) * 0.03;
    target.current.position.y += (driftY - target.current.position.y) * 0.03;
    target.current.rotation.y += ((reducedMotion ? 0 : state.pointer.x * 0.05) - target.current.rotation.y) * 0.035;
  });

  return null;
}
