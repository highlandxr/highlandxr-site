import { useEffect, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function useHeroWheelProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    let target = 0;
    let current = 0;

    const animate = () => {
      current += (target - current) * 0.08;
      setProgress(current);

      if (Math.abs(target - current) > 0.001) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
      }
    };

    const onWheel = (event: WheelEvent) => {
      target = clamp(target + event.deltaY * 0.00075, 0, 1);

      if (!frame) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return progress;
}
