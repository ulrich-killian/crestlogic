"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const CrestLogisticsAppWithNoSSR = dynamic(() => import("../../../App"), {
  ssr: false,
});

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {

    router.push("/admin/dashboard");
  };

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-[#FAF5E9]">
      <CrestLogisticsAppWithNoSSR 
        forceAdminLogin={true} 
        onLoginSuccess={handleLoginSuccess} 
      />
    </div>
  );
}
