import { matchPath } from "react-router-dom";
import type { PageMetadata } from "@/app/types";
import { getItemById, getItems } from "@/content/legacy/items";
import HomePageComponent from "@/pages/HomePage";
import LegacyEventsPageComponent from "@/pages/LegacyEventsPage";
import LegacyBusinessesPageComponent from "@/pages/LegacyBusinessesPage";
import ItemDetailPageComponent from "@/pages/ItemDetailPage";
import SubmitEventPageComponent from "@/pages/SubmitEventPage";
import SubmitBusinessPageComponent from "@/pages/SubmitBusinessPage";
import NotFoundPageComponent from "@/pages/NotFoundPage";

export const HomePage = HomePageComponent;
export const EventsArchivePage = LegacyEventsPageComponent;
export const BusinessesArchivePage = LegacyBusinessesPageComponent;
export const ItemDetailPage = ItemDetailPageComponent;
export const SubmitEventPage = SubmitEventPageComponent;
export const SubmitBusinessPage = SubmitBusinessPageComponent;
export const NotFoundPage = NotFoundPageComponent;

const routeMetadata: Array<{
  path: string;
  resolve: (pathname: string) => PageMetadata;
}> = [
  {
    path: "/",
    resolve: () => ({
      title: "HighlandXR | Spatial studio for immersive web experiences",
      description:
        "HighlandXR is a spatial studio building immersive environments, prototype worlds, and premium web-native experiences with a clean path toward 3D.",
      canonicalPath: "/"
    })
  },
  {
    path: "/events",
    resolve: () => ({
      title: "Events Archive | HighlandXR",
      description: "Archive of Highlands XR meetups, demos, showcases, and events retained from the earlier directory site.",
      canonicalPath: "/events"
    })
  },
  {
    path: "/businesses",
    resolve: () => ({
      title: "Business Archive | HighlandXR",
      description: "Archive of Highlands XR businesses, studios, venues, and organisations from the previous HighlandXR network site.",
      canonicalPath: "/businesses"
    })
  },
  {
    path: "/submit-event",
    resolve: () => ({
      title: "Submit Event | HighlandXR",
      description: "Archive intake form for Highlands XR events.",
      canonicalPath: "/submit-event"
    })
  },
  {
    path: "/submit-business",
    resolve: () => ({
      title: "Submit Business | HighlandXR",
      description: "Archive intake form for Highlands XR businesses.",
      canonicalPath: "/submit-business"
    })
  },
  {
    path: "/items/:id",
    resolve: (pathname) => {
      const id = pathname.split("/").filter(Boolean).at(-1) ?? "";
      const item = getItemById(id);

      if (!item) {
        return {
          title: "Archive Item | HighlandXR",
          description: "Archive entry for the HighlandXR network.",
          canonicalPath: pathname
        };
      }

      return {
        title: `${item.title} | HighlandXR`,
        description: item.description,
        canonicalPath: `/items/${item.id}`
      };
    }
  }
];

export function resolvePageMetadata(pathname: string): PageMetadata {
  for (const definition of routeMetadata) {
    if (matchPath({ path: definition.path, end: true }, pathname)) {
      return definition.resolve(pathname);
    }
  }

  return {
    title: "HighlandXR | Page not found",
    description: "The requested HighlandXR page could not be found.",
    canonicalPath: pathname
  };
}

export function getPrerenderRoutes() {
  return [
    "/",
    "/events",
    "/businesses",
    "/submit-event",
    "/submit-business",
    ...getItems().map((item) => `/items/${item.id}`)
  ];
}
