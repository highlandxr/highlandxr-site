"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Vector3 } from "three";
import type { Item } from "@/lib/items";
import ImmersiveBackground from "./ImmersiveBackground";
import ImmersiveGallery from "./ImmersiveGallery";

interface ImmersiveCanvasProps {
  items: Item[];
}

function getScrollProgress() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, scrollTop / maxScroll));
}

function CameraDriftRig({ scrollProgress }: { scrollProgress: number }) {
  const cameraTarget = useMemo(() => new Vector3(0, -1.3, -10), []);

  useFrame((state) => {
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;
    const targetX = pointerX * 0.34;
    const targetY = 1.55 - scrollProgress * 0.7 + pointerY * 0.08;
    const targetZ = 6.7 - scrollProgress * 0.2;

    state.camera.position.x += (targetX - state.camera.position.x) * 0.04;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.04;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.04;
    state.camera.lookAt(cameraTarget);
  });

  return null;
}

export default function ImmersiveCanvas({ items }: ImmersiveCanvasProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const next = getScrollProgress();
        setScrollProgress((current) => (Math.abs(current - next) < 0.001 ? current : next));
      });
    };

    const onVisibility = () => setIsVisible(!document.hidden);

    onScroll();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.7, 6.6], fov: 42, near: 0.1, far: 200 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={isVisible ? "always" : "never"}
      >
        <color attach="background" args={["#030509"]} />
        <fog attach="fog" args={["#030509", 12, 46]} />
        <ambientLight intensity={0.28} color="#88a8ba" />
        <directionalLight intensity={0.52} color="#5fae88" position={[7, 9, 8]} />
        <directionalLight intensity={0.22} color="#5f75ba" position={[-7, 4, -6]} />

        <Suspense fallback={null}>
          <CameraDriftRig scrollProgress={scrollProgress} />
          <ImmersiveBackground scrollProgress={scrollProgress} />
          <ImmersiveGallery items={items} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
