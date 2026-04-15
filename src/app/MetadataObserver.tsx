import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyPageMetadata } from "@/app/metadata/head";
import { resolvePageMetadata } from "@/app/routes";

export default function MetadataObserver() {
  const location = useLocation();

  useEffect(() => {
    applyPageMetadata(resolvePageMetadata(location.pathname));
  }, [location.pathname]);

  return null;
}
