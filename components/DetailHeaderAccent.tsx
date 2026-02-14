"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { ShaderMaterial } from "three";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isLowPowerDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency ?? 8;

  if (typeof memory === "number" && memory <= 4) {
    return true;
  }

  return cores <= 4;
}

function Ribbon() {
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-0.26, 0, 0]}>
      <planeGeometry args={[8.8, 2.2, 120, 18]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={`
          varying vec2 vUv;
          uniform float uTime;

          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.y += sin((uv.x * 7.2) + (uTime * 0.35)) * 0.18;
            pos.y += sin((uv.x * 14.0) - (uTime * 0.2)) * 0.07;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;

          void main() {
            float wave = sin((vUv.x * 10.0) + (uTime * 0.4)) * 0.5 + 0.5;
            float mask = smoothstep(0.05, 0.35, vUv.y) * (1.0 - smoothstep(0.54, 0.98, vUv.y));
            vec3 cyan = vec3(0.37, 0.76, 0.76);
            vec3 violet = vec3(0.42, 0.4, 0.66);
            vec3 color = mix(cyan, violet, wave);
            gl_FragColor = vec4(color, mask * 0.42);
          }
        `}
      />
    </mesh>
  );
}

export default function DetailHeaderAccent() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMode = () => {
      setEnabled(!mediaQuery.matches && supportsWebGL() && !isLowPowerDevice());
    };

    const onVisibility = () => {
      setIsVisible(!document.hidden);
    };

    updateMode();
    onVisibility();
    mediaQuery.addEventListener("change", updateMode);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateMode);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!enabled) {
    return <div aria-hidden className="h-32 rounded-panel border border-white/10 bg-aurora aurora-motion opacity-45" />;
  }

  return (
    <div aria-hidden className="h-40 overflow-hidden rounded-panel border border-white/10 bg-surface-panel/45">
      <Canvas dpr={[1, 1.4]} camera={{ position: [0, 0, 5], fov: 38 }} gl={{ alpha: true, antialias: true }} frameloop={isVisible ? "always" : "never"}>
        <ambientLight intensity={0.35} />
        <Ribbon />
      </Canvas>
    </div>
  );
}
