import { useEffect, useState } from "react";

export function useSceneActivity(enabled: boolean) {
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  useEffect(() => {
    const onVisibilityChange = () => setIsDocumentVisible(!document.hidden);
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return enabled && isDocumentVisible;
}
