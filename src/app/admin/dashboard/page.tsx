"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const CrestLogisticsAppWithNoSSR = dynamic(() => import("../../../App"), {
  ssr: false,
});

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Post-session, redirect back to login
    router.push("/admin/login");
  };

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-[#FAF5E9]">
      <CrestLogisticsAppWithNoSSR 
        forceAdminDashboard={true} 
        onLogout={handleLogout} 
      />
    </div>
  );
}
