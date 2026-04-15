import { useEffect, useMemo, useState } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { HERO_CAMERA } from "@/scene/core/camera";
import type { WorldPanelAnchor } from "@/scene/types";

interface WorldPanelOverlayProps {
  anchors?: WorldPanelAnchor[];
  scrollProgress: number;
  reducedMotion: boolean;
}

interface OverlayPanelPosition {
  id: string;
  left: string;
  top: string;
  anchor: WorldPanelAnchor;
}

function projectAnchor(
  camera: PerspectiveCamera,
  anchor: WorldPanelAnchor,
  viewport: { width: number; height: number },
  scrollProgress: number,
  reducedMotion: boolean
) {
  const [offsetX = 0, offsetY = 0] = anchor.overlayOffset ?? [0, 0];
  const driftX = reducedMotion ? 0 : scrollProgress * -0.12;
  const driftY = reducedMotion ? 0 : scrollProgress * 0.18;
  const vector = new Vector3(anchor.position[0] + driftX, anchor.position[1] + driftY, anchor.position[2]);

  vector.project(camera);

  return {
    id: anchor.id,
    left: `${((vector.x + 1) * 0.5) * viewport.width + offsetX}px`,
    top: `${((-vector.y + 1) * 0.5) * viewport.height + offsetY}px`,
    anchor
  };
}

export default function WorldPanelOverlay({
  anchors = [],
  scrollProgress,
  reducedMotion
}: WorldPanelOverlayProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  const camera = useMemo(() => {
    const perspectiveCamera = new PerspectiveCamera(HERO_CAMERA.fov, 1, HERO_CAMERA.near, HERO_CAMERA.far);
    perspectiveCamera.position.set(...HERO_CAMERA.position);
    perspectiveCamera.lookAt(0, -0.45, -8);
    return perspectiveCamera;
  }, []);

  const overlayPanels = useMemo<OverlayPanelPosition[]>(() => {
    if (!viewport.width || !viewport.height) {
      return [];
    }

    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();

    return anchors
      .map((anchor) => projectAnchor(camera, anchor, viewport, scrollProgress, reducedMotion))
      .filter((panel) => Number.parseFloat(panel.left) >= -240 && Number.parseFloat(panel.left) <= viewport.width + 120);
  }, [anchors, camera, reducedMotion, scrollProgress, viewport]);

  return (
    <div className="world-panel-overlay" aria-hidden>
      {overlayPanels.map(({ id, left, top, anchor }) => (
        <article key={id} className="world-panel" style={{ left, top }}>
          {anchor.eyebrow ? <p className="world-panel__eyebrow">{anchor.eyebrow}</p> : null}
          <h3 className="world-panel__title">{anchor.label}</h3>
          {anchor.body ? <p className="world-panel__body">{anchor.body}</p> : null}
          {anchor.href ? (
            <a href={anchor.href} className="world-panel__link">
              View reference
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
