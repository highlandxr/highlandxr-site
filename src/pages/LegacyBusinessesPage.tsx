import LegacyIndexPage from "@/components/legacy/LegacyIndexPage";
import { getItemsByType } from "@/content/legacy/items";

export default function LegacyBusinessesPage() {
  return (
    <LegacyIndexPage
      eyebrow="Highlands XR directory"
      title="The Highlands XR directory."
      description="An evolving directory of XR studios, immersive venues, cultural organisations, and digital heritage work across the Highlands and Islands."
      items={getItemsByType("business")}
      variant="directory"
    />
  );
}
