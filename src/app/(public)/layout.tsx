import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-grow flex flex-col">{children}</div>;
}
