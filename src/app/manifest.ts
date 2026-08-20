import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sbrilluccica",
    short_name: "Sbrilluccica",
    description: "Gioielli indipendenti dal carattere luminoso.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f3ec",
    theme_color: "#b96572",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
