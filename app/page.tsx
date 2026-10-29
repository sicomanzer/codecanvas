import type { Metadata } from "next";
import { Ide } from "@/components/Ide";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "CodeCanvas — Online HTML, CSS & JavaScript Playground",
  description:
    "Write and run HTML, CSS and JavaScript in your browser with instant live preview, a real console, templates and shareable links. Free, fast and no account needed.",
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CodeCanvas",
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  description:
    "An online HTML, CSS and JavaScript playground with live preview, console, templates and shareable links.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "HTML, CSS and JavaScript editor",
    "Live preview",
    "JavaScript console",
    "Shareable links",
    "Download as a single HTML file",
    "Starter templates",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Ide />
    </>
  );
}
