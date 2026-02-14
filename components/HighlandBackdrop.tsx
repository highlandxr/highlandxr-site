"use client";

import { Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Points,
  ShaderMaterial,
  Vector2
} from "three";

const AURORA_INTENSITY = 0.42;
const WATER_WAVE_STRENGTH = 0.26;
const PARTICLE_COUNT = 96;

interface HillLayerConfig {
  color: string;
  baseY: number;
  amplitude: number;
  frequency: number;
  phase: number;
  mist: number;
  opacity: number;
  sideBias: number;
  valleyDepth: number;
  yOffset: number;
}

const HILL_LAYERS: HillLayerConfig[] = [
  {
    color: "#25384a",
    baseY: 0.64,
    amplitude: 0.05,
    frequency: 5.2,
    phase: 0.4,
    mist: 0.95,
    opacity: 0.36,
    sideBias: 0.3,
    valleyDepth: -0.035,
    yOffset: 0.08
  },
  {
    color: "#1d3042",
    baseY: 0.59,
    amplitude: 0.06,
    frequency: 6.1,
    phase: 1.6,
    mist: 0.8,
    opacity: 0.44,
    sideBias: 0.42,
    valleyDepth: -0.045,
    yOffset: 0.04
  },
  {
    color: "#18283a",
    baseY: 0.53,
    amplitude: 0.072,
    frequency: 6.8,
    phase: 2.8,
    mist: 0.6,
    opacity: 0.52,
    sideBias: 0.72,
    valleyDepth: -0.052,
    yOffset: 0.01
  },
  {
    color: "#132031",
    baseY: 0.49,
    amplitude: 0.085,
    frequency: 7.3,
    phase: 3.9,
    mist: 0.42,
    opacity: 0.62,
    sideBias: 0.85,
    valleyDepth: -0.06,
    yOffset: -0.025
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
      uMotion: { value: 1 },
      uAuroraStrength: { value: AURORA_INTENSITY }
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
      uniform float uAuroraStrength;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += noise(p) * amplitude;
          p *= 2.04;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec3 skyBottom = vec3(0.018, 0.032, 0.07);
        vec3 skyTop = vec3(0.003, 0.008, 0.02);
        vec3 color = mix(skyBottom, skyTop, smoothstep(0.08, 1.0, vUv.y));

        float starField = hash(floor(vUv * vec2(260.0, 170.0)));
        float stars = step(0.9965, starField) * smoothstep(0.5, 1.0, vUv.y);
        color += vec3(0.45, 0.56, 0.76) * stars * 0.34;

        float drift = uTime * 0.06 * uMotion;
        float nA = fbm(vec2(vUv.x * 3.6, vUv.y * 4.4 + drift));
        float nB = fbm(vec2(vUv.x * 4.8 + 9.7, vUv.y * 6.0 - drift * 0.84));
        float nC = fbm(vec2(vUv.x * 2.7 - 4.4, vUv.y * 7.1 + drift * 0.52));

        float arcA = 0.77 + sin(vUv.x * 3.8 + drift * 1.4) * 0.065 + (nA - 0.5) * 0.16;
        float arcB = 0.7 + sin(vUv.x * 5.6 - drift * 1.2 + 1.6) * 0.05 + (nB - 0.5) * 0.13;
        float arcC = 0.83 + sin(vUv.x * 2.2 + drift * 0.9 + 3.2) * 0.042 + (nC - 0.5) * 0.1;

        float bandA = smoothstep(0.18, 0.0, abs(vUv.y - arcA));
        float bandB = smoothstep(0.15, 0.0, abs(vUv.y - arcB));
        float bandC = smoothstep(0.13, 0.0, abs(vUv.y - arcC));
        float skyMask = smoothstep(0.45, 0.72, vUv.y);

        vec3 auroraA = mix(vec3(0.08, 0.2, 0.16), vec3(0.18, 0.42, 0.34), nA);
        vec3 auroraB = mix(vec3(0.07, 0.18, 0.2), vec3(0.14, 0.34, 0.33), nB);
        vec3 auroraC = vec3(0.18, 0.14, 0.28);

        vec3 auroraColor = auroraA * bandA * 0.72 + auroraB * bandB * 0.54 + auroraC * bandC * 0.2;
        float auroraAlpha = (bandA * 0.26 + bandB * 0.17 + bandC * 0.11) * skyMask * uAuroraStrength;

        color += auroraColor * auroraAlpha;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createHillMaterial(config: HillLayerConfig) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uColor: { value: new Color(config.color) },
      uBaseY: { value: config.baseY },
      uAmplitude: { value: config.amplitude },
      uFrequency: { value: config.frequency },
      uPhase: { value: config.phase },
      uMist: { value: config.mist },
      uOpacity: { value: config.opacity },
      uSideBias: { value: config.sideBias },
      uValleyDepth: { value: config.valleyDepth }
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
      uniform vec3 uColor;
      uniform float uBaseY;
      uniform float uAmplitude;
      uniform float uFrequency;
      uniform float uPhase;
      uniform float uMist;
      uniform float uOpacity;
      uniform float uSideBias;
      uniform float uValleyDepth;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 3; i++) {
          value += noise(p) * amplitude;
          p *= 2.03;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        float phase = uPhase + (uTime * 0.03 * uMotion * (0.2 + uMist * 0.4));
        float ridge = uBaseY;
        ridge += sin(vUv.x * uFrequency + phase) * uAmplitude;
        ridge += sin(vUv.x * (uFrequency * 1.82) - phase * 1.24) * (uAmplitude * 0.46);
        ridge += (fbm(vec2(vUv.x * 3.1 + phase * 0.2, phase * 0.08)) - 0.5) * (uAmplitude * 0.72);

        float valley = 1.0 - smoothstep(0.0, 0.34, abs(vUv.x - 0.5));
        ridge += valley * uValleyDepth;

        float silhouette = 1.0 - smoothstep(ridge - 0.016, ridge + 0.032, vUv.y);
        float sideEmphasis = mix(1.0, smoothstep(0.06, 0.42, abs(vUv.x - 0.5)), uSideBias);
        float mistLift = smoothstep(ridge - 0.03, ridge + 0.08, vUv.y);

        vec3 mistColor = vec3(0.26, 0.33, 0.41);
        vec3 color = mix(uColor, mistColor, (uMist * 0.72) + (mistLift * uMist * 0.34));

        float alpha = silhouette * sideEmphasis * uOpacity;
        alpha *= mix(1.0, 0.68 + (1.0 - mistLift) * 0.32, uMist);
        alpha *= 1.0 - smoothstep(0.92, 1.0, vUv.y);

        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

function createWaterMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uWaveStrength: { value: WATER_WAVE_STRENGTH }
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
      uniform float uWaveStrength;

      void main() {
        float horizonY = 0.5;
        float fieldTop = 0.18;
        float ySpan = max(horizonY - fieldTop, 0.0001);
        float depth = clamp((horizonY - vUv.y) / ySpan, 0.0, 1.0);

        float halfWidth = mix(0.055, 0.58, pow(depth, 0.84));
        float dx = abs(vUv.x - 0.5);
        float fanMask = 1.0 - smoothstep(halfWidth - 0.015, halfWidth + 0.02, dx);

        float belowHorizon = 1.0 - smoothstep(horizonY - 0.008, horizonY + 0.012, vUv.y);
        float aboveField = smoothstep(fieldTop - 0.012, fieldTop + 0.012, vUv.y);
        float waterMask = fanMask * belowHorizon * aboveField;

        float drift = uTime * uMotion;
        float waveA = sin(vUv.x * mix(128.0, 44.0, depth) + drift * 0.68 + depth * 8.0) * 0.5 + 0.5;
        float waveB = sin((vUv.x * 54.0 - vUv.y * 33.0) - drift * 0.46) * 0.5 + 0.5;
        float waveC = sin((vUv.x * 16.0 + vUv.y * 86.0) + drift * 0.24) * 0.5 + 0.5;
        float ripple = waveA * 0.5 + waveB * 0.35 + waveC * 0.15;

        vec3 farColor = vec3(0.026, 0.085, 0.13);
        vec3 nearColor = vec3(0.05, 0.14, 0.18);
        vec3 waterColor = mix(farColor, nearColor, depth);
        waterColor += vec3(0.1, 0.2, 0.22) * (ripple - 0.5) * uWaveStrength;

        float sheen = smoothstep(0.82, 1.0, ripple) * 0.08;
        waterColor += vec3(0.18, 0.3, 0.34) * sheen;

        float alpha = waterMask * (0.46 + depth * 0.24);
        gl_FragColor = vec4(waterColor, alpha);
      }
    `
  });
}

function createFieldMaterial() {
  return new ShaderMaterial({
    transparent: true,
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

      void main() {
        float fieldTop = 0.18;
        float fieldMask = 1.0 - smoothstep(fieldTop - 0.012, fieldTop + 0.014, vUv.y);
        float grad = smoothstep(0.0, fieldTop, vUv.y);

        vec3 fieldDeep = vec3(0.07, 0.14, 0.06);
        vec3 fieldBright = vec3(0.2, 0.31, 0.11);
        vec3 fieldColor = mix(fieldDeep, fieldBright, grad * 0.72);

        float sway = sin(vUv.x * 120.0 + (uTime * 0.06 * uMotion)) * 0.5 + 0.5;
        fieldColor *= 0.86 + sway * 0.08;

        float hedgerow = smoothstep(fieldTop + 0.005, fieldTop - 0.004, vUv.y);
        fieldColor = mix(fieldColor, vec3(0.035, 0.05, 0.03), hedgerow * 0.55);

        gl_FragColor = vec4(fieldColor, fieldMask * 0.94);
      }
    `
  });
}

function createMistMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
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

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      void main() {
        float band = smoothstep(0.3, 0.46, vUv.y) * (1.0 - smoothstep(0.54, 0.72, vUv.y));
        float n = noise(vec2(vUv.x * 9.0 + uTime * 0.035 * uMotion, vUv.y * 3.0));
        float alpha = band * (0.14 + n * 0.08);
        vec3 color = vec3(0.23, 0.29, 0.36);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

function createParticles() {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const speeds = new Float32Array(PARTICLE_COUNT);

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 0.8;
    positions[stride + 1] = -0.26 - Math.random() * 0.12;
    positions[stride + 2] = -0.04 + Math.random() * 0.08;
    speeds[index] = 0.05 + Math.random() * 0.06;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return { geometry, positions, speeds };
}

interface HighlandSceneProps {
  reducedMotion: boolean;
  parallaxEnabled: boolean;
}

function HighlandScene({ reducedMotion, parallaxEnabled }: HighlandSceneProps) {
  const groupRef = useRef<Group>(null);
  const particlesRef = useRef<Points>(null);
  const viewport = useThree((state) => state.viewport);
  const pointerTargetRef = useRef(new Vector2(0, 0));
  const pointerCurrentRef = useRef(new Vector2(0, 0));

  const skyMaterial = useMemo(() => createSkyMaterial(), []);
  const hillMaterials = useMemo(() => HILL_LAYERS.map((layer) => createHillMaterial(layer)), []);
  const waterMaterial = useMemo(() => createWaterMaterial(), []);
  const fieldMaterial = useMemo(() => createFieldMaterial(), []);
  const mistMaterial = useMemo(() => createMistMaterial(), []);
  const particleData = useMemo(() => createParticles(), []);

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
      hillMaterials.forEach((material) => material.dispose());
      waterMaterial.dispose();
      fieldMaterial.dispose();
      mistMaterial.dispose();
      particleData.geometry.dispose();
    };
  }, [fieldMaterial, hillMaterials, mistMaterial, particleData.geometry, skyMaterial, waterMaterial]);

  useFrame((state, delta) => {
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const motion = reducedMotion ? 0 : 1;

    skyMaterial.uniforms.uTime.value = elapsed;
    skyMaterial.uniforms.uMotion.value = motion;
    waterMaterial.uniforms.uTime.value = elapsed;
    waterMaterial.uniforms.uMotion.value = motion;
    fieldMaterial.uniforms.uTime.value = elapsed;
    fieldMaterial.uniforms.uMotion.value = motion;
    mistMaterial.uniforms.uTime.value = elapsed;
    mistMaterial.uniforms.uMotion.value = motion;

    for (const hillMaterial of hillMaterials) {
      hillMaterial.uniforms.uTime.value = elapsed;
      hillMaterial.uniforms.uMotion.value = motion;
    }

    if (groupRef.current) {
      pointerCurrentRef.current.lerp(pointerTargetRef.current, 0.05);

      const idleX = Math.sin(elapsed * 0.11) * 0.02;
      const idleY = Math.cos(elapsed * 0.08) * 0.014;
      const targetX = idleX + (parallaxEnabled ? pointerCurrentRef.current.x * 0.035 : 0);
      const targetY = idleY + (parallaxEnabled ? pointerCurrentRef.current.y * 0.024 : 0);

      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
    }

    if (!reducedMotion && particlesRef.current) {
      const positionsAttribute = particlesRef.current.geometry.attributes.position as BufferAttribute;

      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        const stride = index * 3;
        particleData.positions[stride + 1] += particleData.speeds[index] * delta;
        particleData.positions[stride] += Math.sin(elapsed * 0.42 + index * 0.74) * 0.00026;

        if (particleData.positions[stride + 1] > 0.045) {
          particleData.positions[stride + 1] = -0.28 - Math.random() * 0.1;
          particleData.positions[stride] = (Math.random() - 0.5) * 0.8;
        }
      }

      positionsAttribute.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, -0.3]} renderOrder={0}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <primitive object={skyMaterial} attach="material" />
      </mesh>

      {hillMaterials.map((material, index) => (
        <mesh
          key={`hill-layer-${index}`}
          scale={[viewport.width, viewport.height, 1]}
          position={[0, HILL_LAYERS[index].yOffset, -0.18 + index * 0.035]}
          renderOrder={index + 1}
        >
          <planeGeometry args={[1, 1, 1, 1]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}

      <mesh scale={[viewport.width, viewport.height, 1]} position={[0, -0.01, 0.02]} renderOrder={6}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <primitive object={waterMaterial} attach="material" />
      </mesh>

      <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0.02, 0.025]} renderOrder={7}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <primitive object={mistMaterial} attach="material" />
      </mesh>

      <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, 0.04]} renderOrder={8}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <primitive object={fieldMaterial} attach="material" />
      </mesh>

      {!reducedMotion ? (
        <points ref={particlesRef} geometry={particleData.geometry} scale={[viewport.width, viewport.height, 1]} position={[0, 0, 0.08]} renderOrder={9}>
          <pointsMaterial color="#88b7bf" size={0.02} transparent opacity={0.14} sizeAttenuation depthWrite={false} />
        </points>
      ) : null}
    </group>
  );
}

function StaticFallback() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#020611_0%,#061126_42%,#0b1b12_100%)]" />
      <div className="absolute inset-x-0 top-[20%] h-[45%] bg-[radial-gradient(80%_70%_at_50%_0%,rgba(76,130,116,0.24)_0%,rgba(76,130,116,0)_70%)]" />
      <div className="absolute inset-x-0 top-[36%] h-[34%] bg-[linear-gradient(180deg,rgba(18,42,66,0.45)_0%,rgba(11,36,53,0.72)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[linear-gradient(180deg,rgba(28,52,20,0.86)_0%,rgba(18,34,12,0.96)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_92%_at_50%_46%,transparent_36%,rgba(0,0,0,0.64)_100%)]" />
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

  if (!canUseWebGL || reducedMotion) {
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
        <HighlandScene reducedMotion={reducedMotion} parallaxEnabled={parallaxEnabled} />
        <Preload all />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_92%_at_50%_46%,transparent_36%,rgba(0,0,0,0.64)_100%)]" />
    </div>
  );
}
