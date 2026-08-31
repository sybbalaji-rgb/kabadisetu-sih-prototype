import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KabadiSetu SIH Prototype",
  description:
    "An offline-friendly digital bridge between informal e-waste collectors and verified recyclers.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
