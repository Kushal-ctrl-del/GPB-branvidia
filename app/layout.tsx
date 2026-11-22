import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Branvidia — AI Business Profile Optimization Platform",
  description:
    "Editorial-grade AI optimization and audit platform for Google Business Profiles by Branvidia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full flex flex-col antialiased bg-paper-100 text-charcoal-900 selection:bg-branvidia-100 selection:text-branvidia-950">
        {children}
      </body>
    </html>
  );
}
