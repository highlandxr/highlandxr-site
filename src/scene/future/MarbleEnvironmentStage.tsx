import type { MarbleEnvironmentSource } from "@/scene/types";

interface MarbleEnvironmentStageProps {
  source?: MarbleEnvironmentSource;
  visible?: boolean;
}

export default function MarbleEnvironmentStage({ visible = false }: MarbleEnvironmentStageProps) {
  // Future integration point for authored Marble exports once environment assets are ready.
  if (!visible) {
    return null;
  }

  return (
    <group position={[0, -1.1, -7.5]}>
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[2.4, 0.05, 12, 72]} />
        <meshBasicMaterial color="#7d74d6" transparent opacity={0.14} />
      </mesh>
      <mesh>
        <boxGeometry args={[5.6, 2.8, 0.04]} />
        <meshBasicMaterial color="#90aec4" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}
