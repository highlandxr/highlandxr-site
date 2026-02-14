"use client";

import { Edges, Float, Text } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  MathUtils,
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
  panelGeometry: PlaneGeometry;
  scanTexture?: CanvasTexture;
}

function createPanelGeometry() {
  const geometry = new PlaneGeometry(2.9, 1.72, 38, 18);
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index) / 2.9;
    const y = positions.getY(index) / 1.72;
    const bend = Math.pow(x, 2) * -0.14 + Math.pow(y, 2) * -0.03;
    positions.setZ(index, bend + Math.sin(y * 3.2) * 0.01);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createScanTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 384;

  const context = canvas.getContext("2d");
  if (!context) {
    return undefined;
  }

  context.fillStyle = "rgba(0, 0, 0, 0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 4) {
    context.fillStyle = y % 10 === 0 ? "rgba(166, 236, 229, 0.14)" : "rgba(166, 236, 229, 0.04)";
    context.fillRect(0, y, canvas.width, 1);
  }

  for (let x = 0; x < canvas.width; x += 22) {
    context.fillStyle = "rgba(115, 174, 255, 0.07)";
    context.fillRect(x, 0, 1, canvas.height);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(75, 124, 160, 0.08)");
  gradient.addColorStop(1, "rgba(10, 18, 30, 0.12)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function createGlowMaterial() {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uFocus: { value: 0 }
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
      uniform float uFocus;

      void main() {
        float edgeX = smoothstep(0.0, 0.12, vUv.x) * smoothstep(0.0, 0.12, 1.0 - vUv.x);
        float edgeY = smoothstep(0.0, 0.2, vUv.y) * smoothstep(0.0, 0.16, 1.0 - vUv.y);
        float frame = edgeX * edgeY;
        float scan = sin((vUv.y * 150.0) + (uTime * 4.6)) * 0.5 + 0.5;
        float pulse = sin((vUv.x * 24.0) + (uTime * 1.9)) * 0.5 + 0.5;
        float mask = frame * (0.07 + scan * 0.07 + pulse * 0.05) * (0.45 + uFocus * 0.75);
        vec3 color = mix(vec3(0.35, 0.66, 0.77), vec3(0.62, 0.97, 0.9), uFocus);
        gl_FragColor = vec4(color, mask);
      }
    `
  });
}

function formatPanelDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
}

function ScreenPanel({ item, index, total, scrollProgress, panelGeometry, scanTexture }: ScreenPanelProps) {
  const router = useRouter();
  const groupRef = useRef<Group>(null);
  const panelRef = useRef<Mesh>(null);
  const glowMaterialRef = useRef<ShaderMaterial>(null);

  const glowMaterial = useMemo(() => createGlowMaterial(), []);
  const accentColor = useMemo(() => new Color(item.type === "event" ? "#8eb9ff" : "#8ee5da"), [item.type]);
  const metaLine = `${item.location.toUpperCase()} / ${item.type.toUpperCase()}`;

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const timeline = scrollProgress * Math.max(total - 1, 1);
    const offset = index - timeline;
    const focusStrength = Math.max(0, 1 - Math.min(1.25, Math.abs(offset)));
    const lane = index % 2 === 0 ? -1 : 1;
    const depth = Math.abs(offset);
    const centerPull = MathUtils.clamp(1 - depth / 1.2, 0, 1);

    if (groupRef.current) {
      const sideX = lane * 2.05 + Math.sin((timeline + index * 0.4) * 0.65) * 0.45;
      const centerX = Math.sin(elapsed * 0.33 + index * 0.6) * 0.15;
      const targetX = MathUtils.lerp(sideX, centerX, centerPull);
      const targetY = -offset * 2.5;
      const targetZ = -1.1 - depth * 2.2 + centerPull * 0.55 + Math.cos(elapsed * 0.2 + index) * 0.1;
      const floatY = Math.sin(elapsed * 0.72 + index) * 0.06;

      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
      groupRef.current.position.y += (targetY + floatY - groupRef.current.position.y) * 0.08;
      groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.08;
      groupRef.current.rotation.y += ((MathUtils.lerp(offset * -0.2, 0, centerPull)) - groupRef.current.rotation.y) * 0.08;
      groupRef.current.rotation.x += ((0.05 + Math.sin(elapsed * 0.45 + index) * 0.01) - groupRef.current.rotation.x) * 0.08;

      const targetScale = 0.94 + focusStrength * 0.12;
      groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * 0.08;
      groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * 0.08;
      groupRef.current.scale.z += (1 - groupRef.current.scale.z) * 0.08;
    }

    if (panelRef.current) {
      const material = panelRef.current.material as MeshPhysicalMaterial;
      material.emissive = accentColor;
      material.emissiveIntensity = 0.16 + focusStrength * 0.42;
      material.opacity = 0.45 + focusStrength * 0.31;
      material.roughness = 0.36 - focusStrength * 0.12;
    }

    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.uTime.value = elapsed;
      glowMaterialRef.current.uniforms.uFocus.value = focusStrength;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    router.push(`/items/${item.id}`);
  };

  return (
    <Float speed={0.45} rotationIntensity={0.06} floatIntensity={0.14}>
      <group
        ref={groupRef}
        onClick={handleClick}
        onPointerEnter={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          document.body.style.cursor = "default";
        }}
      >
        <mesh ref={panelRef} geometry={panelGeometry}>
          <meshPhysicalMaterial
            color="#152234"
            transparent
            opacity={0.64}
            roughness={0.28}
            metalness={0.2}
            transmission={0.38}
            clearcoat={0.52}
            clearcoatRoughness={0.3}
          />
          <Edges color="#76ddd1" threshold={22} />
        </mesh>

        <mesh geometry={panelGeometry} position={[0, 0, 0.02]}>
          <meshBasicMaterial
            map={scanTexture}
            color="#9ad8d9"
            transparent
            opacity={0.15}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        <mesh geometry={panelGeometry} position={[0, 0, 0.03]}>
          <primitive object={glowMaterial} ref={glowMaterialRef} attach="material" />
        </mesh>

        <Text
          position={[0, 0.24, 0.06]}
          fontSize={0.122}
          maxWidth={2.35}
          textAlign="center"
          color="#ecf8ff"
          anchorX="center"
          anchorY="middle"
        >
          {item.title}
        </Text>

        <Text
          position={[0, -0.26, 0.06]}
          fontSize={0.066}
          maxWidth={2.45}
          textAlign="center"
          color="#8fbec7"
          anchorX="center"
          anchorY="middle"
        >
          {metaLine}
        </Text>

        {item.date ? (
          <Text
            position={[0, -0.49, 0.06]}
            fontSize={0.06}
            maxWidth={2.2}
            textAlign="center"
            color="#79c3bb"
            anchorX="center"
            anchorY="middle"
          >
            {formatPanelDate(item.date)}
          </Text>
        ) : null}
      </group>
    </Float>
  );
}

export default function ImmersiveGallery({ items, scrollProgress }: ImmersiveGalleryProps) {
  const panelGeometry = useMemo(() => createPanelGeometry(), []);
  const scanTexture = useMemo(() => createScanTexture(), []);

  return (
    <group position={[0, 0.3, -1]}>
      {items.map((item, index) => (
        <ScreenPanel
          key={item.id}
          item={item}
          index={index}
          total={items.length}
          scrollProgress={scrollProgress}
          panelGeometry={panelGeometry}
          scanTexture={scanTexture}
        />
      ))}
    </group>
  );
}
