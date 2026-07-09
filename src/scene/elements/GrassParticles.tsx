import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Points, ShaderMaterial } from "three";
import type { SceneQuality } from "@/scene/systems/useSceneCapability";

interface GrassParticlesProps {
  reducedMotion: boolean;
  quality: SceneQuality;
}

function createParticleGeometry(total: number) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(total * 3);
  const phases = new Float32Array(total);
  const heights = new Float32Array(total);

  for (let index = 0; index < total; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 17;
    positions[stride + 1] = -0.45 + Math.random() * 0.32;
    positions[stride + 2] = -3.6 - Math.random() * 10.5;
    phases[index] = Math.random();
    heights[index] = 1.5 + Math.random() * 2.7;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aPhase", new BufferAttribute(phases, 1));
  geometry.setAttribute("aHeight", new BufferAttribute(heights, 1));
  return geometry;
}

function createParticleMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color("#a3e8cf") }
    },
    vertexShader: `
      attribute float aPhase;
      attribute float aHeight;
      uniform float uTime;
      varying float vAlpha;

      void main() {
        float life = fract(aPhase + uTime * 0.072);
        vec3 pos = position;
        pos.y += life * aHeight;
        pos.x += sin((life * 5.0) + (aPhase * 18.0)) * 0.12;
        pos.z += cos((life * 4.0) + (aPhase * 13.0)) * 0.06;

        float appear = smoothstep(0.02, 0.15, life);
        float dissolve = 1.0 - smoothstep(0.56, 0.96, life);
        vAlpha = appear * dissolve * (0.32 + fract(aPhase * 17.0) * 0.32);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (0.8 + fract(aPhase * 31.0) * 0.65) * (22.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;

      void main() {
        float distanceToCenter = length(gl_PointCoord - 0.5);
        float dotShape = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
        gl_FragColor = vec4(uColor, dotShape * vAlpha);
      }
    `
  });
}

export default function GrassParticles({ reducedMotion, quality }: GrassParticlesProps) {
  const pointsRef = useRef<Points>(null);
  const particleCount = quality === "high" ? 130 : quality === "medium" ? 84 : 50;
  const geometry = useMemo(() => createParticleGeometry(particleCount), [particleCount]);
  const material = useMemo(() => createParticleMaterial(), []);

  useFrame((state) => {
    if (pointsRef.current) {
      material.uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
