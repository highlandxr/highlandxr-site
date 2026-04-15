import LegacyIndexPage from "@/components/legacy/LegacyIndexPage";
import { getItemsByType } from "@/content/legacy/items";

export default function LegacyBusinessesPage() {
  return (
    <LegacyIndexPage
      eyebrow="Business archive"
      title="Studios, venues, and organisations in the Highlands XR network."
      description="A retained archive of the directory-era business listings while the main site now positions HighlandXR as a spatial studio."
      items={getItemsByType("business")}
    />
  );
}
