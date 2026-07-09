import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, Mesh, PlaneGeometry } from "three";

interface TerrainFormsProps {
  scrollProgress: number;
  quality: "low" | "medium" | "high";
}

function heightAt(x: number, y: number) {
  const ridge = Math.sin(x * 0.18) * 0.45 + Math.cos((x + y) * 0.13) * 0.35;
  const valley = Math.exp(-Math.pow(x / 8, 2)) * -1.2;
  const sideRise = Math.min(2.2, Math.pow(Math.abs(x) / 10, 1.22)) * 1.15;
  return ridge + valley + sideRise + y * 0.04;
}

function createTerrainGeometry(width: number, height: number, widthSegments: number, heightSegments: number) {
  const geometry = new PlaneGeometry(width, height, widthSegments, heightSegments);
  const positions = geometry.attributes.position as BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    positions.setZ(index, heightAt(x, y));
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export default function TerrainForms({ scrollProgress, quality }: TerrainFormsProps) {
  const leftRef = useRef<Mesh>(null);
  const rightRef = useRef<Mesh>(null);
  const farRef = useRef<Mesh>(null);
  const floorRef = useRef<Mesh>(null);
  const ridgeSegments = quality === "high" ? [88, 42] : quality === "medium" ? [64, 30] : [36, 18];
  const fieldSegments = quality === "high" ? [64, 26] : quality === "medium" ? [42, 18] : [24, 10];

  const ridgeGeometry = useMemo(() => createTerrainGeometry(46, 22, ridgeSegments[0], ridgeSegments[1]), [ridgeSegments]);
  const fieldGeometry = useMemo(() => createTerrainGeometry(34, 14, fieldSegments[0], fieldSegments[1]), [fieldSegments]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (leftRef.current) {
      leftRef.current.position.z = -10.8 + scrollProgress * 1.2;
      leftRef.current.rotation.z = -0.08 + Math.sin(time * 0.18) * 0.01;
    }

    if (rightRef.current) {
      rightRef.current.position.z = -10.8 + scrollProgress * 1.2;
      rightRef.current.rotation.z = 0.08 - Math.sin(time * 0.16) * 0.01;
    }

    if (farRef.current) {
      farRef.current.position.z = -17.6 + scrollProgress * 0.45;
    }

    if (floorRef.current) {
      floorRef.current.position.z = -4.3 + scrollProgress * 0.8;
    }
  });

  return (
    <group>
      <mesh ref={farRef} geometry={ridgeGeometry} rotation-x={-Math.PI * 0.5} position={[0, -5.4, -17.6]} scale={[1.2, 0.62, 0.72]}>
        <meshBasicMaterial color="#7fa5a8" transparent opacity={0.22} />
      </mesh>

      <mesh geometry={ridgeGeometry} rotation-x={-Math.PI * 0.5} position={[0, -5.31, -17.55]} scale={[1.2, 0.62, 0.72]}>
        <meshBasicMaterial color="#b9d7c7" wireframe transparent opacity={0.34} />
      </mesh>

      <mesh ref={leftRef} geometry={ridgeGeometry} rotation-x={-Math.PI * 0.5} position={[-15.5, -3.45, -10.8]} scale={[0.9, 1, 0.9]}>
        <meshBasicMaterial color="#315d70" transparent opacity={0.45} />
      </mesh>

      <mesh geometry={ridgeGeometry} rotation-x={-Math.PI * 0.5} position={[-15.5, -3.38, -10.72]} scale={[0.9, 1, 0.9]}>
        <meshBasicMaterial color="#8ec4bd" wireframe transparent opacity={0.55} />
      </mesh>

      <mesh ref={rightRef} geometry={ridgeGeometry} rotation-x={-Math.PI * 0.5} position={[15.5, -3.45, -10.8]} scale={[-0.9, 1, 0.9]}>
        <meshBasicMaterial color="#3f7180" transparent opacity={0.48} />
      </mesh>

      <mesh geometry={ridgeGeometry} rotation-x={-Math.PI * 0.5} position={[15.5, -3.38, -10.72]} scale={[-0.9, 1, 0.9]}>
        <meshBasicMaterial color="#9bcfc1" wireframe transparent opacity={0.58} />
      </mesh>

      <mesh ref={floorRef} geometry={fieldGeometry} rotation-x={-Math.PI * 0.5} position={[0, -4.25, -4.3]}>
        <meshBasicMaterial color="#253d45" transparent opacity={0.86} />
      </mesh>

      <mesh geometry={fieldGeometry} rotation-x={-Math.PI * 0.5} position={[0, -4.17, -4.2]}>
        <meshBasicMaterial color="#d48b61" wireframe transparent opacity={0.38} />
      </mesh>
    </group>
  );
}
