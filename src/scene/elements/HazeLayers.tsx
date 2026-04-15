import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Mesh, ShaderMaterial } from "three";

interface HazeLayersProps {
  reducedMotion: boolean;
}

function createMistMaterial(opacity: number) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: opacity }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.x += sin((uv.y * 4.0) + (uTime * 0.04)) * 0.24;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uOpacity;

      void main() {
        float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(0.0, 0.18, 1.0 - vUv.x);
        float band = smoothstep(0.0, 0.62, vUv.y) * (1.0 - smoothstep(0.56, 1.0, vUv.y));
        vec3 color = vec3(0.38, 0.48, 0.58);
        gl_FragColor = vec4(color, edge * band * uOpacity);
      }
    `
  });
}

export default function HazeLayers({ reducedMotion }: HazeLayersProps) {
  const nearRef = useRef<ShaderMaterial>(null);
  const farRef = useRef<ShaderMaterial>(null);
  const glowRef = useRef<Mesh>(null);

  const nearMaterial = useMemo(() => createMistMaterial(0.11), []);
  const farMaterial = useMemo(() => createMistMaterial(0.08), []);

  useFrame((state) => {
    const time = reducedMotion ? 0 : state.clock.elapsedTime;

    if (nearRef.current) {
      nearRef.current.uniforms.uTime.value = time;
    }

    if (farRef.current) {
      farRef.current.uniforms.uTime.value = time + 4.2;
    }

    if (glowRef.current && !reducedMotion) {
      glowRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 0.22) * 0.03;
    }
  });

  return (
    <group>
      <mesh position={[0, -2.3, -9.4]}>
        <planeGeometry args={[42, 4.5, 1, 1]} />
        <primitive object={nearMaterial} ref={nearRef} attach="material" />
      </mesh>

      <mesh position={[0, -2.8, -12.8]}>
        <planeGeometry args={[36, 3.8, 1, 1]} />
        <primitive object={farMaterial} ref={farRef} attach="material" />
      </mesh>

      <mesh ref={glowRef} position={[0, -1.6, -11.4]}>
        <planeGeometry args={[26, 5.5, 1, 1]} />
        <meshBasicMaterial color="#7ab8ce" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}
