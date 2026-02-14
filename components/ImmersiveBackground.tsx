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
  ShaderMaterial
} from "three";

interface ImmersiveBackgroundProps {
  scrollProgress: number;
}

function terrainHeight(x: number, y: number) {
  const valley = Math.exp(-Math.pow(x / 8.5, 2)) * -2.1;
  const sideRise = Math.min(2.6, Math.pow(Math.abs(x) / 9.5, 1.25)) * 1.35;
  const depthFalloff = Math.max(0, (y + 18) / 32) * 0.85;
  const ridgeNoise = Math.sin((x + y) * 0.22) * 0.28 + Math.cos((x - y) * 0.18) * 0.22;
  return sideRise + valley + ridgeNoise + depthFalloff;
}

function createTerrainGeometry() {
  const geometry = new PlaneGeometry(84, 46, 128, 84);
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

function createFieldGeometry() {
  const geometry = new PlaneGeometry(70, 16, 68, 26);
  const positions = geometry.attributes.position as BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const ripple = Math.sin(x * 0.2) * 0.05 + Math.cos(y * 0.24) * 0.04;
    positions.setZ(index, ripple);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createLochGeometry() {
  const geometry = new PlaneGeometry(40, 12, 64, 24);
  const positions = geometry.attributes.position as BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const basin = Math.exp(-(Math.pow(x / 10.2, 2) + Math.pow(y / 4.8, 2))) * -0.22;
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
        pos.z += sin((uv.x * 24.0) + (uTime * 0.28)) * 0.05;
        pos.z += sin((uv.y * 20.0) - (uTime * 0.22)) * 0.03;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float waveA = sin((vUv.x * 44.0) + (uTime * 0.78)) * 0.5 + 0.5;
        float waveB = sin((vUv.y * 70.0) - (uTime * 0.44)) * 0.5 + 0.5;
        float horizon = smoothstep(0.06, 0.96, vUv.y);

        vec3 deep = vec3(0.02, 0.05, 0.1);
        vec3 tint = vec3(0.06, 0.12, 0.2);
        vec3 highlight = vec3(0.2, 0.38, 0.56);
        vec3 color = mix(deep, tint, horizon);
        color = mix(color, highlight, waveA * 0.12 + waveB * 0.08);

        float alpha = 0.18 + horizon * 0.08;
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
        pos.y += sin((uv.x * 7.4) + (uTime * 0.06)) * 0.34;
        pos.y += sin((uv.x * 13.0) - (uTime * 0.04)) * 0.16;
        pos.x += sin((uv.y * 3.8) + (uTime * 0.05)) * 0.1;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float ribbon = smoothstep(0.1, 0.58, vUv.y) * (1.0 - smoothstep(0.46, 1.0, vUv.y));
        float drift = sin(uTime * 0.035) * 0.5 + 0.5;
        float pulse = sin((vUv.x + vUv.y) * 9.0 + (uTime * 0.08)) * 0.5 + 0.5;

        vec3 green = mix(vec3(0.16, 0.41, 0.3), vec3(0.24, 0.62, 0.46), drift);
        vec3 cyan = vec3(0.22, 0.52, 0.58);
        vec3 violet = vec3(0.3, 0.28, 0.46);
        vec3 color = mix(green, cyan, smoothstep(0.2, 0.74, vUv.x));
        color = mix(color, violet, smoothstep(0.64, 1.0, vUv.x) * 0.45);

        float alpha = ribbon * (0.06 + pulse * 0.04);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

function createMistMaterial() {
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
        pos.x += sin((uv.y * 4.0) + (uTime * 0.05)) * 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;

      void main() {
        float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(0.0, 0.16, 1.0 - vUv.x);
        float band = smoothstep(0.0, 0.6, vUv.y) * (1.0 - smoothstep(0.58, 1.0, vUv.y));
        float grain = sin((vUv.x * 10.0) + (uTime * 0.09)) * 0.5 + 0.5;
        float alpha = edge * band * (0.08 + grain * 0.05);
        vec3 color = vec3(0.4, 0.5, 0.58);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

function createParticles() {
  const geometry = new BufferGeometry();
  const total = 220;
  const positions = new Float32Array(total * 3);

  for (let index = 0; index < total; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 48;
    positions[stride + 1] = Math.random() * 7 - 5.8;
    positions[stride + 2] = (Math.random() - 0.5) * 24 - 7;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
}

export default function ImmersiveBackground({ scrollProgress }: ImmersiveBackgroundProps) {
  const sceneRef = useRef<Group>(null);
  const terrainPulseRef = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);
  const auroraRef = useRef<ShaderMaterial>(null);
  const lochRef = useRef<ShaderMaterial>(null);
  const mistNearRef = useRef<ShaderMaterial>(null);
  const mistFarRef = useRef<ShaderMaterial>(null);

  const terrainGeometry = useMemo(() => createTerrainGeometry(), []);
  const lochGeometry = useMemo(() => createLochGeometry(), []);
  const fieldGeometry = useMemo(() => createFieldGeometry(), []);
  const lochMaterial = useMemo(() => createLochMaterial(), []);
  const particlesGeometry = useMemo(() => createParticles(), []);
  const particleColor = useMemo(() => new Color("#8fc8c1"), []);
  const auroraMaterial = useMemo(() => createAuroraMaterial(), []);
  const mistMaterialNear = useMemo(() => createMistMaterial(), []);
  const mistMaterialFar = useMemo(() => createMistMaterial(), []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (sceneRef.current) {
      const pointerX = state.pointer.x;
      const pointerY = state.pointer.y;
      sceneRef.current.position.x += ((pointerX * 0.32) - sceneRef.current.position.x) * 0.035;
      sceneRef.current.position.y += ((pointerY * 0.15 - scrollProgress * 0.46) - sceneRef.current.position.y) * 0.035;
      sceneRef.current.rotation.y += ((pointerX * 0.045) - sceneRef.current.rotation.y) * 0.04;
    }

    if (auroraRef.current) {
      auroraRef.current.uniforms.uTime.value = elapsed;
    }

    if (lochRef.current) {
      lochRef.current.uniforms.uTime.value = elapsed;
    }

    if (mistNearRef.current) {
      mistNearRef.current.uniforms.uTime.value = elapsed;
    }

    if (mistFarRef.current) {
      mistFarRef.current.uniforms.uTime.value = elapsed + 4.6;
    }

    if (terrainPulseRef.current) {
      const material = terrainPulseRef.current.material as { opacity: number };
      material.opacity = 0.05 + Math.sin(elapsed * 0.24) * 0.01;
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position as BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        const drift = Math.sin(elapsed * 0.16 + index * 0.41) * 0.0008;
        const y = positions.getY(index) + 0.0025 + drift;
        positions.setY(index, y > 4.8 ? -5.8 : y);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <group ref={sceneRef}>
      <mesh geometry={terrainGeometry} rotation-x={-Math.PI * 0.5} position={[-18, -3.5, -13.9]} scale={[0.95, 1, 1.06]}>
        <meshBasicMaterial color="#6ca76f" wireframe transparent opacity={0.2} />
      </mesh>

      <mesh geometry={terrainGeometry} rotation-x={-Math.PI * 0.5} position={[18, -3.5, -13.9]} scale={[-0.95, 1, 1.06]}>
        <meshBasicMaterial color="#6ca76f" wireframe transparent opacity={0.2} />
      </mesh>

      <mesh ref={terrainPulseRef} geometry={terrainGeometry} rotation-x={-Math.PI * 0.5} position={[0, -3.42, -13.95]}>
        <meshBasicMaterial color="#3f6d46" transparent opacity={0.05} />
      </mesh>

      <mesh geometry={fieldGeometry} rotation-x={-Math.PI * 0.5} position={[0, -4.28, -5.1]}>
        <meshBasicMaterial color="#39683a" transparent opacity={0.14} />
      </mesh>

      <mesh geometry={fieldGeometry} rotation-x={-Math.PI * 0.5} position={[0, -4.26, -5.05]}>
        <meshBasicMaterial color="#78b56d" wireframe transparent opacity={0.21} />
      </mesh>

      <mesh position={[0, -3.66, -7.25]}>
        <planeGeometry args={[58, 0.42, 1, 1]} />
        <meshBasicMaterial color="#0e161a" transparent opacity={0.55} />
      </mesh>

      <mesh geometry={lochGeometry} rotation-x={-Math.PI * 0.5} position={[0, -3.9, -8.9]}>
        <primitive object={lochMaterial} ref={lochRef} attach="material" />
      </mesh>

      <mesh geometry={lochGeometry} rotation-x={-Math.PI * 0.5} position={[0, -3.86, -8.87]}>
        <meshBasicMaterial color="#5a8cc7" wireframe transparent opacity={0.28} />
      </mesh>

      <mesh position={[0, -2.7, -12.4]}>
        <planeGeometry args={[34, 3.6, 1, 1]} />
        <primitive object={mistMaterialFar} ref={mistFarRef} attach="material" />
      </mesh>

      <mesh position={[0, -2.35, -10.45]}>
        <planeGeometry args={[42, 4.6, 1, 1]} />
        <primitive object={mistMaterialNear} ref={mistNearRef} attach="material" />
      </mesh>

      <mesh position={[0, 6.2, -18]} rotation-x={-0.1}>
        <planeGeometry args={[48, 18, 1, 1]} />
        <primitive object={auroraMaterial} ref={auroraRef} attach="material" />
      </mesh>

      <points ref={particlesRef} geometry={particlesGeometry} position={[0, -0.2, -9.9]}>
        <pointsMaterial color={particleColor} size={0.034} transparent opacity={0.14} sizeAttenuation />
      </points>
    </group>
  );
}
