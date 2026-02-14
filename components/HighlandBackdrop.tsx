"use client";

import { Preload } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { BufferAttribute, Group, PlaneGeometry, Vector2 } from "three";

const WIREFRAME_COLOR = "#24d7ff";
const WIREFRAME_OPACITY = 0.58;

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
  const width = 40;
  const depth = 30;
  const geometry = new PlaneGeometry(width, depth, 88, 68);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position as BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);

    const nx = x / (width * 0.5);
    const nz = (z + depth * 0.5) / depth;

    // Keep the middle flatter and widen toward the viewer.
    const valleyHalfWidth = 0.18 + nz * 0.2;
    const sideBlend = smoothstep(valleyHalfWidth - 0.07, valleyHalfWidth + 0.08, Math.abs(nx));

    const flatFloor = -0.2 + nz * 0.08 + Math.sin(z * 0.07) * 0.015;

    const sideAmountRaw = Math.max(0, (Math.abs(nx) - valleyHalfWidth) / Math.max(0.001, 1 - valleyHalfWidth));
    const sideAmount = Math.pow(sideAmountRaw, 1.25);
    const depthBoost = 0.9 + (1 - nz) * 0.62;

    const ridgeLarge = (Math.sin(z * 0.34 + x * 0.18) * 0.34 + Math.cos(z * 0.22 - x * 0.24) * 0.22) * Math.pow(Math.abs(nx), 1.2);
    const ridgeFine = Math.sin(x * 0.72 + z * 0.61) * 0.08 * Math.pow(Math.abs(nx), 1.45);

    const sideHeight = flatFloor + sideAmount * depthBoost * 2.05 + ridgeLarge * 0.48 + ridgeFine * 0.2;
    const y = flatFloor * (1 - sideBlend) + sideHeight * sideBlend;

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
  const groupRef = useRef<Group>(null);
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

    if (groupRef.current) {
      const driftX = reducedMotion ? 0 : Math.sin(elapsed * 0.08) * 0.05;
      const driftY = reducedMotion ? 0 : Math.cos(elapsed * 0.06) * 0.03;
      const targetX = (parallaxEnabled ? pointerCurrentRef.current.x * 0.28 : 0) + driftX;
      const targetY = (parallaxEnabled ? pointerCurrentRef.current.y * 0.12 : 0) + driftY;

      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
    }
  });

  return (
    <>
      <color attach="background" args={["#04102a"]} />
      <fog attach="fog" args={["#061832", 7, 44]} />
      <ambientLight intensity={0.26} />

      <group ref={groupRef}>
        <mesh geometry={geometry} position={[0, -2.75, -9.6]} scale={[1.05, 1, 1.08]}>
          <meshBasicMaterial color={WIREFRAME_COLOR} wireframe transparent opacity={WIREFRAME_OPACITY} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

function StaticFallback() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05122f_0%,#0a1e3d_66%,#122e49_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[64%] bg-[radial-gradient(120%_92%_at_50%_100%,rgba(27,113,147,0.42)_0%,rgba(8,20,38,0)_74%)]" />
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
        camera={{ position: [0, 1.75, 7.4], fov: 46, near: 0.1, far: 90 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={isVisible ? "always" : "never"}
      >
        <HillsScene reducedMotion={reducedMotion} parallaxEnabled={parallaxEnabled} />
        <Preload all />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(76%_94%_at_50%_56%,transparent_40%,rgba(1,6,17,0.46)_100%)]" />
    </div>
  );
}
