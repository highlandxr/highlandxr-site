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
  Points,
  PlaneGeometry,
  ShaderMaterial
} from "three";

interface ImmersiveBackgroundProps {
  scrollProgress: number;
}

function terrainHeight(x: number, y: number) {
  const broad = Math.sin(x * 0.11) * 1.1 + Math.cos(y * 0.14) * 0.7;
  const ridges = Math.sin((x + y) * 0.28) * 0.32 + Math.cos((x - y) * 0.22) * 0.22;
  const lochBasin = Math.exp(-(Math.pow(x / 11.5, 2) + Math.pow((y + 2.2) / 4.5, 2))) * -2.2;
  return broad + ridges + lochBasin;
}

function createTerrainGeometry() {
  const geometry = new PlaneGeometry(72, 38, 138, 84);
  const positions = geometry.attributes.position as BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    positions.setZ(index, terrainHeight(x, y));
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createLochGeometry() {
  const geometry = new PlaneGeometry(44, 15, 64, 28);
  const positions = geometry.attributes.position as BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const basin = Math.exp(-(Math.pow(x / 8.7, 2) + Math.pow(y / 4.5, 2))) * -0.34;
    positions.setZ(index, basin);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createLochMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin((uv.x * 24.0) + (uTime * 0.33)) * 0.07;
        pos.z += sin((uv.y * 21.0) - (uTime * 0.28)) * 0.05;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float waveA = sin((vUv.x * 42.0) + (uTime * 0.82)) * 0.5 + 0.5;
        float waveB = sin((vUv.y * 76.0) - (uTime * 0.47)) * 0.5 + 0.5;
        float horizon = smoothstep(0.06, 0.96, vUv.y);
        float scan = sin((vUv.x + vUv.y) * 120.0 + (uTime * 0.8)) * 0.5 + 0.5;

        vec3 deep = vec3(0.035, 0.065, 0.1);
        vec3 tint = vec3(0.08, 0.14, 0.18);
        vec3 highlight = vec3(0.2, 0.34, 0.38);
        vec3 color = mix(deep, tint, horizon);
        color = mix(color, highlight, waveA * 0.14 + waveB * 0.08 + scan * 0.04);

        float alpha = 0.24 + horizon * 0.08;
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
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
        pos.y += sin((uv.x * 8.0) + (uTime * 0.08)) * 0.42;
        pos.y += sin((uv.x * 15.0) - (uTime * 0.05)) * 0.2;
        pos.x += sin((uv.y * 4.0) + (uTime * 0.06)) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float ribbon = smoothstep(0.08, 0.58, vUv.y) * (1.0 - smoothstep(0.45, 0.98, vUv.y));
        float grain = sin((vUv.x * 18.0) + (uTime * 0.16)) * 0.5 + 0.5;
        float pulse = sin((vUv.x + vUv.y) * 10.0 + (uTime * 0.1)) * 0.5 + 0.5;

        vec3 green = vec3(0.33, 0.73, 0.66);
        vec3 cyan = vec3(0.42, 0.74, 0.78);
        vec3 violet = vec3(0.41, 0.39, 0.59);
        vec3 color = mix(green, cyan, smoothstep(0.15, 0.78, vUv.x));
        color = mix(color, violet, smoothstep(0.62, 1.0, vUv.x) * 0.55);

        float alpha = ribbon * (0.1 + grain * 0.06 + pulse * 0.03);
        gl_FragColor = vec4(color, alpha);
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
  const terrainPulseRef = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);
  const auroraRef = useRef<ShaderMaterial>(null);
  const lochRef = useRef<ShaderMaterial>(null);

  const terrainGeometry = useMemo(() => createTerrainGeometry(), []);
  const lochGeometry = useMemo(() => createLochGeometry(), []);
  const lochMaterial = useMemo(() => createLochMaterial(), []);
  const particlesGeometry = useMemo(() => createParticles(), []);
  const particleColor = useMemo(() => new Color("#8de0d3"), []);
  const auroraMaterial = useMemo(() => createAuroraMaterial(), []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (sceneRef.current) {
      const pointerX = state.pointer.x;
      const pointerY = state.pointer.y;
      sceneRef.current.position.x += ((pointerX * 0.38) - sceneRef.current.position.x) * 0.035;
      sceneRef.current.position.y += ((pointerY * 0.16 - scrollProgress * 0.52) - sceneRef.current.position.y) * 0.035;
      sceneRef.current.rotation.y += ((pointerX * 0.05) - sceneRef.current.rotation.y) * 0.04;
    }

    if (auroraRef.current) {
      auroraRef.current.uniforms.uTime.value = elapsed;
    }

    if (lochRef.current) {
      lochRef.current.uniforms.uTime.value = elapsed;
    }

    if (terrainPulseRef.current) {
      const material = terrainPulseRef.current.material as { opacity: number };
      material.opacity = 0.058 + Math.sin(elapsed * 0.28) * 0.012;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position as BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const drift = Math.sin(elapsed * 0.18 + index * 0.43) * 0.0009;
        const y = positions.getY(index) + 0.003 + drift;
        positions.setY(index, y > 5.6 ? -6.4 : y);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <group ref={sceneRef}>
      <mesh geometry={terrainGeometry} rotation-x={-Math.PI * 0.5} position={[0, -3.25, -13.6]}>
        <meshBasicMaterial color="#84ddd4" wireframe transparent opacity={0.1} />
      </mesh>

      <mesh ref={terrainPulseRef} geometry={terrainGeometry} rotation-x={-Math.PI * 0.5} position={[0, -3.22, -13.55]}>
        <meshBasicMaterial color="#5ecdc7" transparent opacity={0.06} />
      </mesh>

      <mesh geometry={lochGeometry} rotation-x={-Math.PI * 0.5} position={[0, -3.9, -9.3]}>
        <primitive object={lochMaterial} ref={lochRef} attach="material" />
      </mesh>

      <mesh position={[0, 6.4, -18]} rotation-x={-0.1}>
        <planeGeometry args={[48, 18, 1, 1]} />
        <primitive object={auroraMaterial} ref={auroraRef} attach="material" />
      </mesh>

      <points ref={particlesRef} geometry={particlesGeometry} position={[0, 0.25, -9.8]}>
        <pointsMaterial color={particleColor} size={0.04} transparent opacity={0.18} sizeAttenuation />
      </points>
    </group>
  );
}
