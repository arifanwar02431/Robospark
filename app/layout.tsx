import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.title}`, template: `%s · ${SITE.name}` },
  description: SITE.tagline,
};

export const viewport: Viewport = {
  themeColor: "#ec6416",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
