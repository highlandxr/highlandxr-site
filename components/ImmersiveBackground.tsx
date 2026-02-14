"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3
} from "three";

interface ImmersiveBackgroundProps {
  scrollProgress: number;
}

function createTerrain() {
  const geometry = new PlaneGeometry(64, 34, 120, 80);
  const positions = geometry.attributes.position as BufferAttribute;
  const baseHeights = new Float32Array(positions.count);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const ridge = Math.sin(x * 0.18) * 1.3 + Math.cos(y * 0.22) * 0.8;
    const valley = Math.exp(-(Math.pow(x / 12, 2) + Math.pow((y + 2.5) / 5, 2))) * -2.4;
    const height = ridge + valley;
    baseHeights[index] = height;
    positions.setZ(index, height);
  }

  geometry.computeVertexNormals();
  return { geometry, baseHeights };
}

function createLoch() {
  const geometry = new PlaneGeometry(38, 14, 80, 40);
  const positions = geometry.attributes.position as BufferAttribute;
  const baseHeights = new Float32Array(positions.count);

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const depth = Math.exp(-(Math.pow(x / 8.5, 2) + Math.pow(y / 4.8, 2))) * -0.25;
    baseHeights[index] = depth;
    positions.setZ(index, depth);
  }

  geometry.computeVertexNormals();
  return { geometry, baseHeights };
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
        pos.y += sin((uv.x * 6.0) + (uTime * 0.18)) * 0.35;
        pos.y += sin((uv.x * 11.0) + (uTime * 0.11)) * 0.18;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float wave = sin(vUv.x * 9.0 + uTime * 0.1) * 0.07;
        float band = smoothstep(0.1, 0.6, vUv.y + wave) * (1.0 - smoothstep(0.45, 0.95, vUv.y));
        vec3 teal = vec3(0.37, 0.89, 0.84);
        vec3 violet = vec3(0.54, 0.45, 0.86);
        vec3 color = mix(teal, violet, smoothstep(0.3, 0.8, vUv.x));
        gl_FragColor = vec4(color, band * 0.24);
      }
    `
  });
}

function createParticles() {
  const geometry = new BufferGeometry();
  const total = 320;
  const positions = new Float32Array(total * 3);
  const seeds = new Float32Array(total);

  for (let index = 0; index < total; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 52;
    positions[stride + 1] = Math.random() * 9 - 6;
    positions[stride + 2] = (Math.random() - 0.5) * 26 - 8;
    seeds[index] = Math.random();
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  return geometry;
}

export default function ImmersiveBackground({ scrollProgress }: ImmersiveBackgroundProps) {
  const sceneRef = useRef<Group>(null);
  const terrainRef = useRef<Mesh>(null);
  const lochRef = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);
  const auroraRef = useRef<ShaderMaterial>(null);

  const terrain = useMemo(() => createTerrain(), []);
  const loch = useMemo(() => createLoch(), []);
  const particlesGeometry = useMemo(() => createParticles(), []);
  const particleColor = useMemo(() => new Color("#8de0d3"), []);
  const auroraMaterial = useMemo(() => createAuroraMaterial(), []);
  const cameraTarget = useMemo(() => new Vector3(0, -1.5, -9), []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (sceneRef.current) {
      const pointerX = state.pointer.x;
      const pointerY = state.pointer.y;
      sceneRef.current.position.x = pointerX * 0.45;
      sceneRef.current.position.y = pointerY * 0.2 - scrollProgress * 0.6;
      sceneRef.current.rotation.y = pointerX * 0.05;
    }

    if (terrainRef.current) {
      const positions = terrain.geometry.attributes.position as BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const pulse = Math.sin(index * 0.07 + elapsed * 0.42) * 0.09;
        positions.setZ(index, terrain.baseHeights[index] + pulse);
      }
      positions.needsUpdate = true;
      terrain.geometry.computeVertexNormals();
    }

    if (lochRef.current) {
      const positions = loch.geometry.attributes.position as BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const pulse = Math.sin(index * 0.11 + elapsed * 0.66) * 0.035;
        positions.setZ(index, loch.baseHeights[index] + pulse);
      }
      positions.needsUpdate = true;
      loch.geometry.computeVertexNormals();
    }

    if (auroraRef.current) {
      auroraRef.current.uniforms.uTime.value = elapsed;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position as BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const y = positions.getY(index) + 0.004 + Math.sin(elapsed + index) * 0.0006;
        positions.setY(index, y > 5.4 ? -6.2 : y);
      }
      positions.needsUpdate = true;
    }

    state.camera.position.x += ((state.pointer.x * 0.45) - state.camera.position.x) * 0.03;
    state.camera.position.y += ((1.65 - scrollProgress * 0.55 + state.pointer.y * 0.08) - state.camera.position.y) * 0.03;
    state.camera.lookAt(cameraTarget);
  });

  return (
    <group ref={sceneRef}>
      <mesh ref={terrainRef} geometry={terrain.geometry} rotation-x={-Math.PI * 0.5} position={[0, -3.2, -13]}>
        <meshBasicMaterial color="#73e6d7" wireframe transparent opacity={0.12} />
      </mesh>

      <mesh ref={lochRef} geometry={loch.geometry} rotation-x={-Math.PI * 0.5} position={[0, -3.85, -8.8]}>
        <meshPhysicalMaterial color="#132136" roughness={0.12} metalness={0.16} transmission={0.22} transparent opacity={0.4} />
      </mesh>

      <mesh position={[0, 6, -18]} rotation-x={-0.12}>
        <planeGeometry args={[42, 16, 1, 1]} />
        <primitive object={auroraMaterial} ref={auroraRef} attach="material" />
      </mesh>

      <points ref={particlesRef} geometry={particlesGeometry} position={[0, 0.2, -10]}>
        <pointsMaterial color={particleColor} size={0.04} transparent opacity={0.22} sizeAttenuation />
      </points>
    </group>
  );
}
