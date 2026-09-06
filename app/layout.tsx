import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KabadiSetu | Formal E-Waste Network",
  description:
    "A multilingual digital bridge connecting e-waste collectors, verified recyclers and JNARDDC oversight.",
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
  other: {
    "codex-preview": "development",
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
