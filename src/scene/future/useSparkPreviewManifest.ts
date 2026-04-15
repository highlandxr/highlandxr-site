import { useEffect, useMemo, useState } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import type { SparkSplatSource } from "@/scene/types";

interface SparkPreviewManifest {
  points: Array<{
    position: [number, number, number];
    size?: number;
  }>;
}

function buildGeometry(manifest: SparkPreviewManifest) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(manifest.points.length * 3);
  const sizes = new Float32Array(manifest.points.length);

  manifest.points.forEach((point, index) => {
    const stride = index * 3;
    positions[stride] = point.position[0];
    positions[stride + 1] = point.position[1];
    positions[stride + 2] = point.position[2];
    sizes[index] = point.size ?? 1;
  });

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  return geometry;
}

export function useSparkPreviewManifest(source?: SparkSplatSource) {
  const [manifest, setManifest] = useState<SparkPreviewManifest | null>(null);

  useEffect(() => {
    let active = true;

    if (!source?.manifestUrl && !source?.sourceUrl) {
      return;
    }

    const manifestUrl = source.manifestUrl ?? source.sourceUrl;

    fetch(manifestUrl)
      .then((response) => response.json())
      .then((data: SparkPreviewManifest) => {
        if (active) {
          setManifest(data);
        }
      })
      .catch(() => {
        if (active) {
          setManifest(null);
        }
      });

    return () => {
      active = false;
    };
  }, [source]);

  return useMemo(() => (manifest ? buildGeometry(manifest) : null), [manifest]);
}
