/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Ship, Clock, ShieldCheck, Menu, X, Landmark, Globe } from "lucide-react";

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export default function Header({ activeSection, onNavigate }: HeaderProps) {
  const [timeStr, setTimeStr] = useState("2026-05-22 16:38:29 UTC");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimeStr(
        now.toISOString().replace("T", " ").replace(/\..+/, "") + " UTC"
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" },
    { id: "track", label: "Track" }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-stone-200/60 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Crest Logistics Brand Logo with Cargo Ship Concept */}
        <div 
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="bg-[#111E19] text-[#F7E4A1] p-2.5 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <Ship className="w-6 h-6 text-[#F7E4A1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-[#111E19] text-xl tracking-tight uppercase">
                CREST<span className="text-[#A35638]"> LOGISTICS</span>
              </span>
              <span className="hidden sm:inline bg-[#FAF5E9] text-[#111E19] border border-stone-200/80 rounded-full px-2.5 py-0.5 text-[9px] font-mono tracking-widest font-bold">
                GLOBAL
              </span>
            </div>
            <p className="text-[10px] font-sans text-stone-500 tracking-wide">
              Premium Integrated Shipping & Cargo Networks
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-[#111E19] text-[#F7E4A1] shadow-sm"
                    : "text-stone-600 hover:text-[#111E19] hover:bg-stone-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Nodes Info badge & Callout */}
        <div className="hidden md:flex items-center gap-3 text-xs font-sans">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200/65 rounded-full text-stone-600 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#A35638]" />
            <span>{timeStr}</span>
          </div>

          <button
            onClick={() => handleNavClick("track")}
            className="bg-[#F7E4A1] hover:bg-[#ebd68f] text-[#111E19] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            Get a Free Quote
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-stone-600 hover:text-[#111E19]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dynamic Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-100 bg-white p-4 flex flex-col gap-2.5 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#111E19] text-[#F7E4A1]"
                    : "text-stone-600 hover:bg-stone-50 hover:text-[#111E19]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          
          <div className="flex items-center justify-between border-t border-stone-100 pt-3.5 mt-1.5 text-xs text-stone-500 font-mono">
            <span>Clock: {timeStr}</span>
            <span className="text-emerald-600 font-bold">● ONLINE</span>
          </div>
        </div>
      )}
    </header>
  );
}
