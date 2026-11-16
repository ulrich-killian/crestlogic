import React from "react";
import "../index.css";

export const metadata = {
  title: "Crest Logistics",
  description: "A premium shipping, manifest verification, and AI-driven routing optimization platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#111f19" />
      </head>
      <body className="antialiased bg-[#111f19] text-stone-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
