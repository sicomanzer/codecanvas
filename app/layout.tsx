import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const siteName = "CodeCanvas";
const description =
  "Write HTML, CSS and JavaScript in your browser and see the result instantly. A free online code playground with live preview, console, templates and shareable links.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${siteName} — Online HTML, CSS & JavaScript Playground`,
    template: `%s · ${siteName}`,
  },
  description,
  applicationName: siteName,
  keywords: [
    "html editor",
    "online html compiler",
    "html css javascript playground",
    "live preview",
    "code editor online",
    "frontend playground",
  ],
  authors: [{ name: siteName }],
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — Online HTML, CSS & JavaScript Playground`,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Online HTML, CSS & JavaScript Playground`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d13" },
  ],
};

const themeScript = `(() => {
  try {
    const raw = localStorage.getItem("codecanvas:settings:v1");
    const settings = raw ? JSON.parse(raw) : {};
    const pref = settings.theme || "dark";
    const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (_) {
    document.documentElement.dataset.theme = "dark";
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
