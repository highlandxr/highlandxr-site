import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type { Group } from "three";
import { heroSceneConfig } from "@/content/heroScene";
import { HERO_CAMERA } from "@/scene/core/camera";
import { resolveHeroEnvironment } from "@/scene/environmentRegistry";
import WorldPanelLayer from "@/scene/future/WorldPanelLayer";
import CameraRig from "@/scene/systems/CameraRig";
import PointerDrift from "@/scene/systems/PointerDrift";
import ReducedMotionGate from "@/scene/systems/ReducedMotionGate";
import type { SceneQuality } from "@/scene/systems/useSceneCapability";

interface SceneCanvasProps {
  scrollProgress: number;
  reducedMotion: boolean;
  active: boolean;
  quality: SceneQuality;
}

export function SceneCanvas({ scrollProgress, reducedMotion, active, quality }: SceneCanvasProps) {
  const environment = resolveHeroEnvironment(heroSceneConfig);
  const driftGroup = useRef<Group | null>(null);
  const dpr: [number, number] = quality === "high" ? [1, 1.25] : quality === "medium" ? [1, 1.1] : [1, 1];
  const performanceMin = quality === "high" ? 0.65 : quality === "medium" ? 0.55 : 0.45;

  return (
    <Canvas
      dpr={dpr}
      camera={HERO_CAMERA}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      performance={{ min: performanceMin }}
      frameloop={active ? "always" : "never"}
      className="absolute inset-0"
    >
      <color attach="background" args={["#241d2d"]} />
      <fog attach="fog" args={["#241d2d", 13, 38]} />
      <ambientLight intensity={0.42} color="#dfb9ae" />
      <directionalLight intensity={0.62} color="#a1c7bf" position={[6, 9, 5]} />
      <directionalLight intensity={0.24} color="#e58d6b" position={[-8, 6, -6]} />

      <Suspense fallback={null}>
        <CameraRig
          scrollProgress={scrollProgress}
          reducedMotion={reducedMotion}
          cameraProfile={environment.camera}
        />
        <PointerDrift target={driftGroup} reducedMotion={reducedMotion} />
        <group ref={driftGroup}>
          <ReducedMotionGate reducedMotion={reducedMotion}>
            <environment.Renderer
              scrollProgress={scrollProgress}
              reducedMotion={reducedMotion}
              quality={quality}
              sparkSource={heroSceneConfig.sparkSource}
              marbleSource={heroSceneConfig.marbleSource}
            />
          </ReducedMotionGate>
        </group>
        <WorldPanelLayer anchors={environment.anchors} />
      </Suspense>
    </Canvas>
  );
}
