import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, Points } from "three";

interface LightFieldProps {
  reducedMotion: boolean;
  quality: "low" | "medium" | "high";
}

function createParticles(total: number) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(total * 3);

  for (let index = 0; index < total; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 28;
    positions[stride + 1] = Math.random() * 7 - 5.5;
    positions[stride + 2] = (Math.random() - 0.5) * 18 - 5;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return geometry;
}

export default function LightField({ reducedMotion, quality }: LightFieldProps) {
  const pointsRef = useRef<Points>(null);
  const particleCount = quality === "high" ? 180 : quality === "medium" ? 110 : 56;
  const geometry = useMemo(() => createParticles(particleCount), [particleCount]);
  const color = useMemo(() => new Color("#9cd3cd"), []);

  useFrame((state) => {
    if (reducedMotion || !pointsRef.current) {
      return;
    }

    const positions = pointsRef.current.geometry.attributes.position as BufferAttribute;

    for (let index = 0; index < positions.count; index += 1) {
      const drift = Math.sin(state.clock.elapsedTime * 0.18 + index * 0.37) * 0.0008;
      const y = positions.getY(index) + 0.003 + drift;
      positions.setY(index, y > 4.8 ? -5.4 : y);
    }

    positions.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, -0.4, -7]}>
      <pointsMaterial color={color} size={0.036} transparent opacity={0.16} sizeAttenuation />
    </points>
  );
}
