import { Route, Routes } from "react-router-dom";
import AppShell from "@/app/AppShell";
import MetadataObserver from "@/app/MetadataObserver";
import ScrollManager from "@/app/ScrollManager";
import {
  BusinessesArchivePage,
  EventsArchivePage,
  HomePage,
  ItemDetailPage,
  NotFoundPage,
  SubmitBusinessPage,
  SubmitEventPage
} from "@/app/routes";

export default function App() {
  return (
    <AppShell>
      <MetadataObserver />
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsArchivePage />} />
        <Route path="/businesses" element={<BusinessesArchivePage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/submit-event" element={<SubmitEventPage />} />
        <Route path="/submit-business" element={<SubmitBusinessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
