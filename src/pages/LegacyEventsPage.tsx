import LegacyIndexPage from "@/components/legacy/LegacyIndexPage";
import { getItemsByType } from "@/content/legacy/items";

export default function LegacyEventsPage() {
  return (
    <LegacyIndexPage
      eyebrow="Events archive"
      title="Past and upcoming Highlands XR events."
      description="A retained archive of meetups, demos, showcases, and local activity from the previous HighlandXR site direction."
      items={getItemsByType("event")}
    />
  );
}
