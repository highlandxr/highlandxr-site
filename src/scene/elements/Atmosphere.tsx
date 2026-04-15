import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Mesh, ShaderMaterial } from "three";

interface AtmosphereProps {
  reducedMotion: boolean;
}

function createAuroraMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.y += sin((uv.x * 6.0) + (uTime * 0.08)) * 0.28;
        pos.y += sin((uv.x * 12.0) - (uTime * 0.05)) * 0.14;
        pos.x += sin((uv.y * 3.0) + (uTime * 0.04)) * 0.12;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float ribbon = smoothstep(0.08, 0.56, vUv.y) * (1.0 - smoothstep(0.48, 1.0, vUv.y));
        float pulse = sin((vUv.x * 10.0) + (uTime * 0.12)) * 0.5 + 0.5;
        vec3 green = vec3(0.18, 0.54, 0.44);
        vec3 cyan = vec3(0.24, 0.52, 0.64);
        vec3 violet = vec3(0.28, 0.22, 0.48);
        vec3 color = mix(green, cyan, smoothstep(0.22, 0.72, vUv.x));
        color = mix(color, violet, smoothstep(0.66, 1.0, vUv.x) * 0.42);
        float alpha = ribbon * (0.06 + pulse * 0.04);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

export default function Atmosphere({ reducedMotion }: AtmosphereProps) {
  const auroraRef = useRef<ShaderMaterial>(null);
  const haloRef = useRef<Mesh>(null);
  const auroraMaterial = useMemo(() => createAuroraMaterial(), []);

  useFrame((state) => {
    if (auroraRef.current) {
      auroraRef.current.uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    }

    if (haloRef.current && !reducedMotion) {
      haloRef.current.position.y = 4.8 + Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={haloRef} position={[0, 4.8, -17]}>
        <sphereGeometry args={[7.6, 48, 48]} />
        <meshBasicMaterial color="#2a5275" transparent opacity={0.08} />
      </mesh>

      <mesh position={[0, 5.8, -15.5]} rotation-x={-0.08}>
        <planeGeometry args={[38, 16, 1, 1]} />
        <primitive object={auroraMaterial} ref={auroraRef} attach="material" />
      </mesh>
    </group>
  );
}
