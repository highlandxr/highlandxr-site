"use client";

import { Preload } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, Mesh, PlaneGeometry, Vector2 } from "three";

interface TerrainLayerConfig {
  color: string;
  opacity: number;
  scale: number;
  positionY: number;
  positionZ: number;
  parallaxX: number;
  parallaxY: number;
  drift: number;
}

const TERRAIN_LAYERS: TerrainLayerConfig[] = [
  {
    color: "#89a8c4",
    opacity: 0.2,
    scale: 1.55,
    positionY: -3.1,
    positionZ: -23,
    parallaxX: 0.12,
    parallaxY: 0.05,
    drift: 0.04
  },
  {
    color: "#6f91b0",
    opacity: 0.28,
    scale: 1.36,
    positionY: -2.95,
    positionZ: -17.5,
    parallaxX: 0.2,
    parallaxY: 0.08,
    drift: 0.055
  },
  {
    color: "#4c7291",
    opacity: 0.36,
    scale: 1.18,
    positionY: -2.8,
    positionZ: -12.6,
    parallaxX: 0.28,
    parallaxY: 0.11,
    drift: 0.07
  },
  {
    color: "#2c6048",
    opacity: 0.5,
    scale: 1.02,
    positionY: -2.68,
    positionZ: -8.7,
    parallaxX: 0.35,
    parallaxY: 0.14,
    drift: 0.085
  }
];

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function supportsWebGL() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return reducedMotion;
}

function useDesktopParallaxEnabled(reducedMotion: boolean) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setEnabled(false);
      return;
    }

    const coarsePointer = window.matchMedia("(pointer: coarse)");

    const onChange = () => {
      setEnabled(window.innerWidth >= 1024 && !coarsePointer.matches);
    };

    onChange();
    coarsePointer.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);

    return () => {
      coarsePointer.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [reducedMotion]);

  return enabled;
}

function createValleyGeometry() {
  const width = 34;
  const depth = 24;
  const geometry = new PlaneGeometry(width, depth, 44, 34);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position as BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);

    const nx = x / (width * 0.5);
    const nz = (z + depth * 0.5) / depth;

    const sideRise = Math.pow(smoothstep(0.13, 0.98, Math.abs(nx)), 1.3) * (1.2 + nz * 2.3);
    const valleyCarve = -Math.exp(-Math.pow(nx / 0.28, 2)) * (0.85 + nz * 1.15);

    const broadRoll = Math.sin(x * 0.42 + z * 0.16) * 0.28 + Math.cos(x * 0.2 - z * 0.22) * 0.21;
    const fineRoll = Math.sin(x * 0.9 + z * 0.56) * 0.09;
    const rippleStrength = 0.3 + nz * 0.6;

    const y = sideRise + valleyCarve + (broadRoll + fineRoll) * rippleStrength;
    positions.setY(index, y);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

interface HillsSceneProps {
  reducedMotion: boolean;
  parallaxEnabled: boolean;
}

function HillsScene({ reducedMotion, parallaxEnabled }: HillsSceneProps) {
  const layerRefs = useRef<Array<Mesh | null>>([]);
  const pointerTargetRef = useRef(new Vector2(0, 0));
  const pointerCurrentRef = useRef(new Vector2(0, 0));
  const geometry = useMemo(() => createValleyGeometry(), []);

  useEffect(() => {
    if (!parallaxEnabled || reducedMotion) {
      pointerTargetRef.current.set(0, 0);
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerTargetRef.current.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * -2 + 1);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [parallaxEnabled, reducedMotion]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state) => {
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;

    pointerCurrentRef.current.lerp(pointerTargetRef.current, 0.05);

    layerRefs.current.forEach((mesh, index) => {
      if (!mesh) {
        return;
      }

      const layer = TERRAIN_LAYERS[index];
      const drift = reducedMotion ? 0 : Math.sin(elapsed * layer.drift + index * 0.9) * (0.05 + index * 0.01);
      const targetX = parallaxEnabled ? pointerCurrentRef.current.x * layer.parallaxX + drift : 0;
      const targetY = layer.positionY + (parallaxEnabled ? pointerCurrentRef.current.y * layer.parallaxY : 0);

      mesh.position.x += (targetX - mesh.position.x) * 0.08;
      mesh.position.y += (targetY - mesh.position.y) * 0.08;
    });
  });

  return (
    <>
      <color attach="background" args={["#05102b"]} />
      <fog attach="fog" args={["#071431", 8, 36]} />
      <ambientLight intensity={0.28} />

      {TERRAIN_LAYERS.map((layer, index) => (
        <mesh
          key={`terrain-layer-${index}`}
          ref={(node) => {
            layerRefs.current[index] = node;
          }}
          geometry={geometry}
          position={[0, layer.positionY, layer.positionZ]}
          scale={[layer.scale, 1, layer.scale]}
          renderOrder={index + 1}
        >
          <meshBasicMaterial color={layer.color} wireframe transparent opacity={layer.opacity} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function StaticFallback() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05102b_0%,#0a1f3b_62%,#12314a_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[64%] bg-[radial-gradient(120%_90%_at_50%_100%,rgba(34,83,104,0.42)_0%,rgba(8,18,35,0)_72%)]" />
    </div>
  );
}

export default function HighlandBackdrop() {
  const [canUseWebGL, setCanUseWebGL] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const parallaxEnabled = useDesktopParallaxEnabled(reducedMotion);

  useEffect(() => {
    setCanUseWebGL(supportsWebGL());

    const onVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  if (!canUseWebGL) {
    return <StaticFallback />;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.9, 7.8], fov: 46, near: 0.1, far: 80 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={isVisible ? "always" : "never"}
      >
        <HillsScene reducedMotion={reducedMotion} parallaxEnabled={parallaxEnabled} />
        <Preload all />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(76%_94%_at_50%_56%,transparent_38%,rgba(1,5,14,0.5)_100%)]" />
    </div>
  );
}
