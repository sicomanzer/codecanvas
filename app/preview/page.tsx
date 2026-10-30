import type { Metadata } from "next";
import { PreviewShare } from "@/components/PreviewShare";

export const metadata: Metadata = {
  title: "Shared preview",
  description: "A preview of a project created with CodeCanvas.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewPage() {
  return <PreviewShare />;
}
