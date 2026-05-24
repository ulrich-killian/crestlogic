"use client";

import React from "react";
import dynamic from "next/dynamic";

const CrestLogisticsAppWithNoSSR = dynamic(() => import("../../App"), {
  ssr: false,
});

export default function PublicPage() {
  return <CrestLogisticsAppWithNoSSR forcePublic={true} />;
}
