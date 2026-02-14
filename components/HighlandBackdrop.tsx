"use client";

import { Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, Color, Group, ShaderMaterial, Vector2 } from "three";

interface HillLayerConfig {
  color: string;
  opacity: number;
  mist: number;
  baseY: number;
  peak: number;
  amplitude: number;
  frequency: number;
  spread: number;
  width: number;
  height: number;
  yOffset: number;
  z: number;
}

const HILL_LAYERS: HillLayerConfig[] = [
  {
    color: "#4c6985",
    opacity: 0.16,
    mist: 0.95,
    baseY: 0.47,
    peak: 0.14,
    amplitude: 0.022,
    frequency: 7.8,
    spread: 0.29,
    width: 0.9,
    height: 0.7,
    yOffset: 0.12,
    z: -0.24
  },
  {
    color: "#375572",
    opacity: 0.2,
    mist: 0.8,
    baseY: 0.44,
    peak: 0.17,
    amplitude: 0.028,
    frequency: 8.4,
    spread: 0.33,
    width: 1,
    height: 0.8,
    yOffset: 0.08,
    z: -0.16
  },
  {
    color: "#29425d",
    opacity: 0.25,
    mist: 0.62,
    baseY: 0.41,
    peak: 0.22,
    amplitude: 0.037,
    frequency: 9.2,
    spread: 0.38,
    width: 1.08,
    height: 0.9,
    yOffset: 0.03,
    z: -0.08
  },
  {
    color: "#1b334d",
    opacity: 0.31,
    mist: 0.42,
    baseY: 0.38,
    peak: 0.27,
    amplitude: 0.046,
    frequency: 10.2,
    spread: 0.43,
    width: 1.16,
    height: 0.98,
    yOffset: -0.02,
    z: 0
  }
];

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

function createSkyMaterial() {
  return new ShaderMaterial({
    transparent: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uMotion: { value: 1 }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;

      uniform float uTime;
      uniform float uMotion;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec3 topColor = vec3(0.015, 0.03, 0.06);
        vec3 bottomColor = vec3(0.01, 0.02, 0.045);
        vec3 color = mix(bottomColor, topColor, smoothstep(0.0, 1.0, vUv.y));

        float grain = (hash(vUv * vec2(640.0, 360.0) + uTime * 0.05 * uMotion) - 0.5) * 0.03;
        color += grain * 0.05;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createHillWireMaterial(layer: HillLayerConfig, side: -1 | 1) {
  return new ShaderMaterial({
    transparent: true,
    wireframe: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uColor: { value: new Color(layer.color) },
      uOpacity: { value: layer.opacity },
      uMist: { value: layer.mist },
      uBaseY: { value: layer.baseY },
      uPeak: { value: layer.peak },
      uAmplitude: { value: layer.amplitude },
      uFrequency: { value: layer.frequency },
      uSide: { value: side }
    },
    vertexShader: `
      varying vec2 vUv;
      varying float vMask;
      varying float vDepth;

      uniform float uTime;
      uniform float uMotion;
      uniform float uBaseY;
      uniform float uPeak;
      uniform float uAmplitude;
      uniform float uFrequency;
      uniform float uSide;

      void main() {
        vUv = uv;
        float phase = uTime * 0.03 * uMotion;

        float towardCenter = (uSide < 0.0) ? uv.x : (1.0 - uv.x);
        float outerStrength = 1.0 - towardCenter;

        float ridge = uBaseY + outerStrength * uPeak;
        ridge += sin((uv.x * uFrequency) + phase + uSide * 0.7) * uAmplitude;
        ridge += sin((uv.x * uFrequency * 1.9) - phase * 1.15 + uSide * 1.3) * (uAmplitude * 0.56);
        ridge += sin((uv.x * 23.0) + phase * 2.0 + uv.y * 5.0) * (uAmplitude * 0.25);

        float mountainMask = 1.0 - smoothstep(ridge - 0.02, ridge + 0.028, uv.y);
        float sideMask = smoothstep(0.08, 0.4, outerStrength);
        float mask = mountainMask * sideMask;

        vec3 pos = position;
        float depth = clamp((ridge - uv.y) * 4.1, 0.0, 1.0);
        float contour = sin((uv.x * 34.0) + (uv.y * 9.0) + phase * 1.3) * 0.5 + 0.5;
        pos.z += depth * (0.15 + outerStrength * 0.09) * mask;
        pos.z += (contour - 0.5) * 0.024 * mask;

        vMask = mask;
        vDepth = depth;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vMask;
      varying float vDepth;

      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uMist;

      void main() {
        if (vMask < 0.015) {
          discard;
        }

        vec3 mistColor = vec3(0.46, 0.56, 0.66);
        vec3 color = mix(uColor, mistColor, uMist * 0.72);
        color = mix(color, vec3(0.62, 0.72, 0.78), vDepth * 0.14);

        float alpha = uOpacity * vMask * (0.8 + vDepth * 0.28);
        alpha *= 1.0 - smoothstep(0.9, 1.0, vUv.y);

        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

interface HillsSceneProps {
  reducedMotion: boolean;
  parallaxEnabled: boolean;
}

function HillsScene({ reducedMotion, parallaxEnabled }: HillsSceneProps) {
  const groupRef = useRef<Group>(null);
  const viewport = useThree((state) => state.viewport);
  const pointerTargetRef = useRef(new Vector2(0, 0));
  const pointerCurrentRef = useRef(new Vector2(0, 0));

  const skyMaterial = useMemo(() => createSkyMaterial(), []);
  const hillMaterialPairs = useMemo(
    () =>
      HILL_LAYERS.map((layer) => ({
        left: createHillWireMaterial(layer, -1),
        right: createHillWireMaterial(layer, 1)
      })),
    []
  );

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
      skyMaterial.dispose();
      hillMaterialPairs.forEach((pair) => {
        pair.left.dispose();
        pair.right.dispose();
      });
    };
  }, [hillMaterialPairs, skyMaterial]);

  useFrame((state) => {
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;

    skyMaterial.uniforms.uTime.value = elapsed;
    skyMaterial.uniforms.uMotion.value = motion;

    hillMaterialPairs.forEach((pair) => {
      pair.left.uniforms.uTime.value = elapsed;
      pair.left.uniforms.uMotion.value = motion;
      pair.right.uniforms.uTime.value = elapsed;
      pair.right.uniforms.uMotion.value = motion;
    });

    if (groupRef.current) {
      pointerCurrentRef.current.lerp(pointerTargetRef.current, 0.045);

      const idleX = Math.sin(elapsed * 0.1) * 0.015;
      const idleY = Math.cos(elapsed * 0.08) * 0.01;
      const targetX = idleX + (parallaxEnabled ? pointerCurrentRef.current.x * 0.03 : 0);
      const targetY = idleY + (parallaxEnabled ? pointerCurrentRef.current.y * 0.018 : 0);

      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, -0.3]} renderOrder={0}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>

      {HILL_LAYERS.map((layer, index) => (
        <group key={`hill-pair-${index}`}>
          <mesh
            scale={[viewport.width * layer.width, viewport.height * layer.height, 1]}
            position={[-viewport.width * layer.spread, viewport.height * layer.yOffset, layer.z]}
            renderOrder={index + 1}
          >
            <planeGeometry args={[1, 1, 176, 126]} />
            <primitive object={hillMaterialPairs[index].left} attach="material" />
          </mesh>

          <mesh
            scale={[viewport.width * layer.width, viewport.height * layer.height, 1]}
            position={[viewport.width * layer.spread, viewport.height * layer.yOffset, layer.z]}
            renderOrder={index + 1}
          >
            <planeGeometry args={[1, 1, 176, 126]} />
            <primitive object={hillMaterialPairs[index].right} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function StaticFallback() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#071226_0%,#0b2032_54%,#0c2337_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[45%] bg-[radial-gradient(120%_80%_at_0%_55%,rgba(85,126,162,0.42)_0%,rgba(85,126,162,0)_68%)]" />
      <div className="absolute inset-y-0 right-0 w-[45%] bg-[radial-gradient(120%_80%_at_100%_55%,rgba(63,103,137,0.44)_0%,rgba(63,103,137,0)_68%)]" />
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
        camera={{ position: [0, 0, 2.8], fov: 44, near: 0.1, far: 20 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={isVisible ? "always" : "never"}
      >
        <HillsScene reducedMotion={reducedMotion} parallaxEnabled={parallaxEnabled} />
        <Preload all />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_90%_at_50%_46%,transparent_34%,rgba(0,0,0,0.62)_100%)]" />
    </div>
  );
}
