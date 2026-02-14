"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
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

export default function ImmersiveCanvas({ items }: ImmersiveCanvasProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrollProgress(getScrollProgress());
    const onVisibility = () => setIsVisible(!document.hidden);

    onScroll();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
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
        <color attach="background" args={["#050608"]} />
        <fog attach="fog" args={["#050608", 14, 52]} />
        <ambientLight intensity={0.4} color="#b7d5e7" />
        <directionalLight intensity={0.8} color="#79d8ca" position={[8, 10, 8]} />
        <directionalLight intensity={0.35} color="#8f80ff" position={[-7, 4, -6]} />

        <Suspense fallback={null}>
          <ImmersiveBackground scrollProgress={scrollProgress} />
          <ImmersiveGallery items={items} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
