import { useMemo } from "react";
import { Color, ShaderMaterial } from "three";
import type { SparkSplatSource } from "@/scene/types";
import { useSparkPreviewManifest } from "@/scene/future/useSparkPreviewManifest";

interface SparkSplatStageProps {
  source?: SparkSplatSource;
  visible?: boolean;
}

export default function SparkSplatStage({ source, visible = false }: SparkSplatStageProps) {
  // Future integration point for Spark SplatScene / SplatMesh rendering.
  // This preview path lets the environment system load a lightweight manifest now,
  // while leaving a clean seam for a real Spark renderer later.
  const geometry = useSparkPreviewManifest(source);
  const fallbackColor = useMemo(() => new Color("#8edbd6"), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColorA: { value: new Color("#8edbd6") },
          uColorB: { value: new Color("#79b2cf") }
        },
        vertexShader: `
          attribute float aSize;
          varying float vMix;

          void main() {
            vMix = clamp((position.y + 1.2) / 2.4, 0.0, 1.0);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (120.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying float vMix;

          void main() {
            vec2 centered = gl_PointCoord - vec2(0.5);
            float alpha = smoothstep(0.5, 0.0, length(centered));
            vec3 color = mix(uColorA, uColorB, vMix);
            gl_FragColor = vec4(color, alpha * 0.72);
          }
        `
      }),
    []
  );

  if (!visible) {
    return null;
  }

  return (
    <group position={[0, -0.25, -5.4]}>
      {geometry ? (
        <points geometry={geometry}>
          <primitive object={material} attach="material" />
        </points>
      ) : (
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
      )}
    </group>
  );
}
