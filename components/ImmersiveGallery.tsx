"use client";

import { Edges, Float, Text } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PlaneGeometry,
  RepeatWrapping,
  ShaderMaterial
} from "three";
import type { Item } from "@/lib/items";

interface ImmersiveGalleryProps {
  items: Item[];
  scrollProgress: number;
}

interface ScreenPanelProps {
  item: Item;
  index: number;
  total: number;
  scrollProgress: number;
}

function createPanelGeometry() {
  const geometry = new PlaneGeometry(2.5, 1.5, 36, 18);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const bend = Math.pow(x / 2.5, 2) * -0.08;
    position.setZ(index, bend);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createScanTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) {
    return undefined;
  }

  context.fillStyle = "rgba(0, 0, 0, 0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 4) {
    context.fillStyle = y % 8 === 0 ? "rgba(166, 236, 229, 0.12)" : "rgba(166, 236, 229, 0.05)";
    context.fillRect(0, y, canvas.width, 1);
  }

  for (let x = 0; x < canvas.width; x += 23) {
    context.fillStyle = "rgba(115, 174, 255, 0.06)";
    context.fillRect(x, 0, 1, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1.2, 1.2);
  return texture;
}

function createGlowMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 }
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

      void main() {
        float edge = smoothstep(0.0, 0.16, vUv.x) * smoothstep(0.0, 0.16, 1.0 - vUv.x);
        float scan = sin((vUv.y * 130.0) + (uTime * 4.4)) * 0.5 + 0.5;
        float mask = edge * (0.1 + scan * 0.08);
        vec3 color = vec3(0.46, 0.93, 0.88);
        gl_FragColor = vec4(color, mask);
      }
    `
  });
}

function ScreenPanel({ item, index, total, scrollProgress }: ScreenPanelProps) {
  const router = useRouter();
  const groupRef = useRef<Group>(null);
  const panelRef = useRef<Mesh>(null);
  const glowMaterialRef = useRef<ShaderMaterial>(null);

  const panelGeometry = useMemo(() => createPanelGeometry(), []);
  const scanTexture = useMemo(() => createScanTexture(), []);
  const glowMaterial = useMemo(() => createGlowMaterial(), []);
  const accentColor = useMemo(() => new Color("#8ee5da"), []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const progressIndex = scrollProgress * Math.max(total - 1, 1);
    const offset = index - progressIndex;
    const focusStrength = Math.max(0, 1 - Math.abs(offset) * 0.6);

    if (groupRef.current) {
      const targetX = Math.sin((index + progressIndex) * 0.58) * 2.8 + offset * 0.45;
      const targetY = -offset * 1.85;
      const targetZ = -Math.abs(offset) * 2.4 + Math.cos(progressIndex * 0.5 + index) * 0.3;
      const floatY = Math.sin(elapsed * 0.85 + index) * 0.08;

      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
      groupRef.current.position.y += (targetY + floatY - groupRef.current.position.y) * 0.08;
      groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.08;
      groupRef.current.rotation.y += ((offset * -0.14) - groupRef.current.rotation.y) * 0.07;
      groupRef.current.rotation.x += ((0.03 + Math.sin(elapsed * 0.6 + index) * 0.02) - groupRef.current.rotation.x) * 0.08;
    }

    if (panelRef.current) {
      const material = panelRef.current.material as MeshPhysicalMaterial;
      material.emissive = accentColor;
      material.emissiveIntensity = 0.2 + focusStrength * 0.45;
      material.opacity = 0.52 + focusStrength * 0.25;
      material.roughness = 0.26 - focusStrength * 0.1;
      material.needsUpdate = true;
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.uTime.value = elapsed;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    router.push(`/items/${item.id}`);
  };

  return (
    <Float speed={0.55} rotationIntensity={0.08} floatIntensity={0.2}>
      <group ref={groupRef} onClick={handleClick}>
        <mesh ref={panelRef} geometry={panelGeometry}>
          <meshPhysicalMaterial
            color="#18283a"
            transparent
            opacity={0.64}
            roughness={0.18}
            metalness={0.28}
            transmission={0.42}
            clearcoat={0.6}
            clearcoatRoughness={0.35}
          />
          <Edges color="#7ce6d8" threshold={20} />
        </mesh>

        <mesh geometry={panelGeometry} position={[0, 0, 0.02]}>
          <meshBasicMaterial
            map={scanTexture}
            color="#9fdeda"
            transparent
            opacity={0.16}
            blending={1}
            depthWrite={false}
          />
        </mesh>

        <mesh geometry={panelGeometry} position={[0, 0, 0.03]}>
          <primitive object={glowMaterial} ref={glowMaterialRef} attach="material" />
        </mesh>

        <Text
          position={[0, 0.2, 0.06]}
          fontSize={0.12}
          maxWidth={2.1}
          textAlign="center"
          color="#ecf8ff"
          anchorX="center"
          anchorY="middle"
        >
          {item.title}
        </Text>

        <Text
          position={[0, -0.28, 0.06]}
          fontSize={0.075}
          maxWidth={2.1}
          textAlign="center"
          color="#8ac7c5"
          anchorX="center"
          anchorY="middle"
        >
          {item.location} • {item.type}
        </Text>
      </group>
    </Float>
  );
}

export default function ImmersiveGallery({ items, scrollProgress }: ImmersiveGalleryProps) {
  return (
    <group position={[0, 0.2, -1]}>
      {items.map((item, index) => (
        <ScreenPanel key={item.id} item={item} index={index} total={items.length} scrollProgress={scrollProgress} />
      ))}
    </group>
  );
}
