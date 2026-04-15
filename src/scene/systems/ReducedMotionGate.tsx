import type { ReactNode } from "react";

interface ReducedMotionGateProps {
  reducedMotion: boolean;
  children: ReactNode;
}

export default function ReducedMotionGate({ children }: ReducedMotionGateProps) {
  return <>{children}</>;
}
