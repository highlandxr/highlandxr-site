import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "@/app/App";
import { getPrerenderRoutes, resolvePageMetadata } from "@/app/routes";

export function render(url: string) {
  const appHtml = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  return {
    appHtml,
    metadata: resolvePageMetadata(url)
  };
}

export { getPrerenderRoutes };
