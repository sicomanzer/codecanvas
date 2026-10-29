import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CodeCanvas — HTML, CSS & JS Playground",
    short_name: "CodeCanvas",
    description:
      "Write HTML, CSS and JavaScript with instant live preview in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#080a10",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
