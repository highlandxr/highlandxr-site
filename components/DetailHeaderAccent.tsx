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

function Ribbon() {
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-0.3, 0, 0]}>
      <planeGeometry args={[8.5, 2.1, 120, 20]} />
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
            pos.y += sin((uv.x * 7.0) + (uTime * 0.9)) * 0.18;
            pos.y += sin((uv.x * 16.0) + (uTime * 0.55)) * 0.07;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;

          void main() {
            float pulse = sin((vUv.x * 10.0) + (uTime * 0.7)) * 0.5 + 0.5;
            float mask = smoothstep(0.05, 0.35, vUv.y) * (1.0 - smoothstep(0.55, 0.98, vUv.y));
            vec3 color = mix(vec3(0.37, 0.88, 0.82), vec3(0.53, 0.45, 0.87), pulse);
            gl_FragColor = vec4(color, mask * 0.65);
          }
        `}
      />
    </mesh>
  );
}

export default function DetailHeaderAccent() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!mediaQuery.matches && supportsWebGL());
  }, []);

  if (!enabled) {
    return <div aria-hidden className="h-32 rounded-panel border border-white/10 bg-aurora opacity-55" />;
  }

  return (
    <div aria-hidden className="h-40 overflow-hidden rounded-panel border border-white/10 bg-surface-panel/50">
      <Canvas dpr={[1, 1.4]} camera={{ position: [0, 0, 5], fov: 38 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.35} />
        <Ribbon />
      </Canvas>
    </div>
  );
}
