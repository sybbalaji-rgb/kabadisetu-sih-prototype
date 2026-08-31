import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KabadiSetu SIH Prototype",
  description:
    "An offline-friendly digital bridge between informal e-waste collectors and verified recyclers.",
  manifest: "/manifest.webmanifest",
  applicationName: "KabadiSetu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KabadiSetu",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#173d30",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
