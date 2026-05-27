import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAM Bistro — OneIT VIP Limited Series",
  description: "A curated tasting of Software Asset Management insights, impact, and software value.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
