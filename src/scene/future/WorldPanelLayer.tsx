import type { WorldPanelAnchor } from "@/scene/types";

interface WorldPanelLayerProps {
  anchors?: WorldPanelAnchor[];
}

export default function WorldPanelLayer({ anchors = [] }: WorldPanelLayerProps) {
  return (
    <group>
      {anchors.map((anchor) => (
        <group key={anchor.id} position={anchor.position}>
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#8edbd6" transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
