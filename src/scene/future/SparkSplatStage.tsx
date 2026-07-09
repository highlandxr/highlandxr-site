import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, Group } from "three";
import type { SceneQuality } from "@/scene/systems/useSceneCapability";
import type { SparkSplatSource } from "@/scene/types";

interface SparkSplatStageProps {
  source?: SparkSplatSource;
  visible?: boolean;
  quality?: SceneQuality;
}

type SparkModule = typeof import("@sparkjsdev/spark");

function getScale(scale?: SparkSplatSource["scale"]): [number, number, number] {
  if (Array.isArray(scale)) {
    return scale;
  }

  if (typeof scale === "number") {
    return [scale, scale, scale];
  }

  return [1, 1, 1];
}

function getQualitySettings(quality: SceneQuality) {
  if (quality === "high") {
    return {
      maxSplats: 500_000,
      maxPixelRadius: 34,
      maxStdDev: Math.sqrt(2.4),
      lod: "quality" as const,
      lodRenderScale: 1.25,
      lodSplatScale: 1,
      minSortIntervalMs: 32
    };
  }

  if (quality === "medium") {
    return {
      maxSplats: 420_000,
      maxPixelRadius: 30,
      maxStdDev: Math.sqrt(2.2),
      lod: true,
      lodRenderScale: 1.55,
      lodSplatScale: 0.82,
      minSortIntervalMs: 64
    };
  }

  return {
      maxSplats: 300_000,
    maxPixelRadius: 26,
      maxStdDev: Math.sqrt(2),
    lod: false,
    lodRenderScale: 2.05,
    lodSplatScale: 0.64,
    minSortIntervalMs: 96
  };
}

function applySourceTransform(
  mesh: {
    position: { set: (x: number, y: number, z: number) => void };
    rotation: { set: (x: number, y: number, z: number) => void };
    scale: { set: (x: number, y: number, z: number) => void };
    opacity: number;
  },
  source?: SparkSplatSource
) {
  const scale = getScale(source?.scale);
  mesh.position.set(...(source?.position ?? [0, 0, 0]));
  mesh.rotation.set(...(source?.rotation ?? [0, 0, 0]));
  mesh.scale.set(...scale);
  mesh.opacity = source?.opacity ?? 1;
}

export default function SparkSplatStage({
  source,
  visible = false,
  quality = "medium"
}: SparkSplatStageProps) {
  const { gl, invalidate, scene } = useThree();
  const groupRef = useRef<Group | null>(null);
  const [failed, setFailed] = useState(false);
  const fallbackColor = useMemo(() => new Color("#8edbd6"), []);
  const sourceSignature = JSON.stringify({
    url: source?.sourceUrl,
    position: source?.position,
    rotation: source?.rotation,
    scale: source?.scale,
    opacity: source?.opacity,
    quality
  });

  useEffect(() => {
    if (!visible || !source?.sourceUrl || !groupRef.current) {
      return;
    }

    let active = true;
    let sparkRenderer: InstanceType<SparkModule["SparkRenderer"]> | null = null;
    let splatMesh: InstanceType<SparkModule["SplatMesh"]> | null = null;
    const qualitySettings = getQualitySettings(quality);
    setFailed(false);

    void import("@sparkjsdev/spark")
      .then(({ SparkRenderer, SplatMesh }) => {
        if (!active || !groupRef.current) {
          return;
        }

        sparkRenderer = new SparkRenderer({
          renderer: gl,
          onDirty: () => invalidate(),
          maxPixelRadius: qualitySettings.maxPixelRadius,
          maxStdDev: qualitySettings.maxStdDev,
          preBlurAmount: 0,
          blurAmount: 0,
          focalAdjustment: 1.6,
          minSortIntervalMs: qualitySettings.minSortIntervalMs,
          lodSplatScale: qualitySettings.lodSplatScale,
          lodRenderScale: qualitySettings.lodRenderScale,
          sortRadial: true
        });

        splatMesh = new SplatMesh({
          url: source.sourceUrl,
          maxSplats: qualitySettings.maxSplats,
          lod: qualitySettings.lod,
          raycastable: false,
          onLoad: (mesh) => {
            applySourceTransform(mesh, source);
            invalidate();
          }
        });

        splatMesh.frustumCulled = false;
        splatMesh.rotation.set(...(source.rotation ?? [0, 0, 0]));

        scene.add(sparkRenderer);
        groupRef.current.add(splatMesh);
        invalidate();
      })
      .catch((error) => {
        console.error("Spark splat stage failed to initialize.", error);

        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;

      if (splatMesh && groupRef.current) {
        groupRef.current.remove(splatMesh);
      }

      splatMesh?.dispose();

      if (sparkRenderer) {
        scene.remove(sparkRenderer);
        sparkRenderer.dispose();
      }
    };
  }, [gl, invalidate, quality, scene, source, sourceSignature, visible]);

  if (!visible) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {failed ? (
        <>
          <mesh>
            <icosahedronGeometry args={[1.45, 2]} />
            <meshBasicMaterial color={fallbackColor} wireframe transparent opacity={0.12} />
          </mesh>
          <mesh scale={[1.2, 1.2, 1.2]}>
            <icosahedronGeometry args={[1.5, 1]} />
            <meshBasicMaterial color="#79b2cf" transparent opacity={0.04} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}
