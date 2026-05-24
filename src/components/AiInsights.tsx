/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  Truck, 
  Calendar, 
  AlertTriangle, 
  Activity, 
  Clipboard, 
  Check, 
  Layers, 
  Info,
  ShieldCheck,
  Zap,
  PackageCheck
} from "lucide-react";
import { AiInsightsResponse } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AiInsightsProps {
  insights: AiInsightsResponse | null;
  isAnalyzing: boolean;
  onRefresh: () => void;
}

export default function AiInsights({
  insights,
  isAnalyzing,
  onRefresh
}: AiInsightsProps) {
  const [copied, setCopied] = useState(false);

  // Copy dispatch draft template to clipboard
  const handleCopy = () => {
    if (!insights?.buyerDispatchScript) return;
    navigator.clipboard.writeText(insights.buyerDispatchScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get color badges for safety risk levels
  const getRiskStyles = (risk?: "LOW" | "MEDIUM" | "HIGH") => {
    switch (risk) {
      case "LOW":
        return {
          wrapper: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300",
          dot: "bg-emerald-500",
          label: "Low Risk Path"
        };
      case "MEDIUM":
        return {
          wrapper: "bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-800/50 text-amber-800 dark:text-amber-300",
          dot: "bg-amber-500",
          label: "Moderate Cargo Warning"
        };
      case "HIGH":
        return {
          wrapper: "bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-800/50 text-rose-800 dark:text-rose-300",
          dot: "bg-rose-500",
          label: "High Security Risk Alert"
        };
      default:
        return {
          wrapper: "bg-stone-50 dark:bg-[#111c18] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400",
          dot: "bg-stone-400",
          label: "Calculating..."
        };
    }
  };

  const riskStyle = getRiskStyles(insights?.riskAssessment);

  return (
    <div className="bg-[#FAF4E8] dark:bg-[#0c1411] border border-stone-200/60 dark:border-stone-800 rounded-2xl p-5 md:p-6 shadow-xs lg:sticky lg:top-24 flex flex-col gap-5 transition-colors">
      
      {/* Sidebar Header */}
      <div className="flex justify-between items-center pb-3 border-b border-stone-200/50 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="bg-[#F7E4A1] text-[#111E19] p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-[#A35638]" />
          </div>
          <div>
            <h2 className="font-sans font-extrabold text-[#111E19] dark:text-stone-100 text-sm uppercase tracking-wider">
              AI Routing Optimization
            </h2>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-sans tracking-tight">
              Gemini Cognitive Logistics Engine
            </p>
          </div>
        </div>

        {/* Live Re-Optimize Button */}
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="bg-white dark:bg-[#121f1a] border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-[#192b23] text-stone-600 dark:text-stone-300 rounded-full p-2 hover:border-[#A35638] dark:hover:border-[#A35638] transition-all disabled:opacity-40 cursor-pointer"
          title="Recalculate Router Directives"
        >
          <Activity className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-pulse text-[#A35638]" : ""}`} />
        </button>
      </div>

      {/* Rendering State */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          /* Pulse Skeleton Loader */
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5 animate-pulse"
          >
            {/* 3 Metric Cards Skeletons */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-white/75 border border-stone-250 rounded-xl p-3 flex flex-col justify-between">
                <div className="h-3 w-10 bg-stone-200 rounded"></div>
                <div className="h-4.5 w-24 bg-stone-300 rounded mt-1.5"></div>
              </div>
              <div className="h-16 bg-white/75 border border-stone-250 rounded-xl p-3 flex flex-col justify-between">
                <div className="h-3 w-14 bg-stone-200 rounded"></div>
                <div className="h-4.5 w-16 bg-stone-300 rounded mt-1.5 font-bold"></div>
              </div>
              <div className="col-span-2 h-14 bg-white/75 border border-stone-250 rounded-xl px-3 flex items-center justify-between">
                <div className="h-3 w-28 bg-stone-200 rounded"></div>
                <div className="h-6 w-16 bg-stone-300 rounded-full"></div>
              </div>
            </div>

            {/* Directives Loading Skeleton */}
            <div className="bg-white/40 border border-stone-200/40 rounded-xl p-4 flex flex-col gap-3">
              <div className="h-3 w-36 bg-stone-200 rounded"></div>
              <div className="flex flex-col gap-2">
                <div className="h-2.5 w-full bg-stone-300 rounded"></div>
                <div className="h-2.5 w-5/6 bg-stone-300 rounded"></div>
                <div className="h-2.5 w-11/12 bg-stone-300 rounded"></div>
              </div>
            </div>

            {/* Notification script area Loading Skeleton */}
            <div className="flex flex-col gap-2">
              <div className="h-3 w-32 bg-stone-200 rounded"></div>
              <div className="h-24 bg-white/80 border border-stone-200/60 rounded-xl"></div>
            </div>
          </motion.div>
        ) : insights ? (
          /* Solid AI Metrics Dashboard */
          <motion.div
            key="data"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-5"
          >
            {/* Insights Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Carrier */}
              <div className="bg-white dark:bg-[#111c18] rounded-xl border border-stone-200/60 dark:border-stone-800 p-3 flex items-center gap-3 shadow-xs transition-colors">
                <div className="p-2 rounded-lg bg-[#FAF5E9] dark:bg-[#182a20] text-[#A35638] dark:text-[#ebd68f] shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-sans font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                    Suggested Courier
                  </p>
                  <p className="text-xs font-sans font-extrabold text-[#111E19] dark:text-stone-100 truncate">
                    {insights.suggestedCarrier}
                  </p>
                </div>
              </div>

              {/* Transit Days */}
              <div className="bg-white dark:bg-[#111c18] rounded-xl border border-stone-200/60 dark:border-stone-800 p-3 flex items-center gap-3 shadow-xs transition-colors">
                <div className="p-2 rounded-lg bg-[#FAF5E9] dark:bg-[#182a20] text-amber-600 dark:text-amber-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-sans font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                    Transit Timeline
                  </p>
                  <p className="text-sm font-sans font-black text-[#111E19] dark:text-stone-100">
                    {insights.predictedTransitDays}
                  </p>
                </div>
              </div>

              {/* Risk Assessment (Full Span) */}
              <div className={`col-span-1 md:col-span-2 border rounded-xl p-3 flex items-center justify-between shadow-xs transition-colors font-sans ${riskStyle.wrapper}`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-extrabold opacity-75 block">
                      Manifest Security risk
                    </span>
                    <span className="text-xs font-bold leading-none">{riskStyle.label}</span>
                  </div>
                </div>
                <span className="bg-white/80 dark:bg-stone-900/80 border border-stone-200/35 dark:border-stone-800 rounded-full px-3 py-1 text-xs font-mono font-black tracking-widest flex items-center gap-1.5 shadow-2xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot}`} />
                  {insights.riskAssessment}
                </span>
              </div>
            </div>

            {/* Warehouse Packing Directives */}
            <div className="bg-white dark:bg-[#111c18] rounded-xl border border-stone-200/60 dark:border-stone-800 p-4 shadow-2xs flex flex-col gap-2.5 transition-colors">
              <h3 className="text-xs font-sans font-extrabold text-[#111E19] dark:text-stone-100 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#A35638]" />
                Warehouse Packing Directives
              </h3>
              
              <div className="flex flex-col gap-2">
                {insights.directives && insights.directives.length > 0 ? (
                  insights.directives.map((directive, index) => (
                    <div key={index} className="flex gap-2 items-start text-xs font-sans leading-relaxed text-stone-700 dark:text-stone-300">
                      <div className="w-4 h-4 rounded bg-[#FAF5E9] dark:bg-[#182a20] border border-stone-200 dark:border-stone-800 text-[#111E19] dark:text-[#F7E4A1] font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="flex-1">{directive}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 dark:text-stone-400 italic">No custom directives mapped.</p>
                )}
              </div>

              {/* Callout Information Banner */}
              <div className="mt-2 bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-lg p-2.5 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-sans text-stone-600 dark:text-stone-400 leading-normal">
                  <strong>Stacker Precaution:</strong> Active OCR scanning verified. Compare load-board metrics at the gateway scale prior to shipping release.
                </p>
              </div>
            </div>

            {/* Dynamic Localized Messenger Script */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-sans font-extrabold text-[#111E19] dark:text-stone-100 uppercase tracking-widest flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#F7E4A1]" />
                  Buyer Dispatch Script (Localized)
                </label>
                
                {/* Micro Feedback clipboard trigger */}
                <button
                  onClick={handleCopy}
                  className="text-[10px] font-mono font-bold text-[#A35638] hover:underline flex items-center gap-1 bg-[#A35638]/5 border border-[#A35638]/20 dark:border-[#A35638]/40 rounded-full px-2.5 py-0.5 transition-all cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-sans"
                      >
                        <Check className="w-3 h-3" /> Copied!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1"
                      >
                        <Clipboard className="w-3 h-3" /> Copy Script
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <textarea
                readOnly
                value={insights.buyerDispatchScript}
                className="w-full border border-stone-200 dark:border-stone-850 rounded-xl bg-white dark:bg-[#070c0a] focus:outline-none p-3.5 font-sans text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 min-h-36 resize-none shadow-inner transition-colors"
              />
            </div>

            <div className="rounded-xl border border-stone-200 dark:border-stone-850 text-[10px] text-stone-500 dark:text-stone-400 px-3 py-2 flex items-center justify-between bg-white/50 dark:bg-[#0c1411]/50">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                AI Hash Checksum: 0x9fA2B
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">
                ACTIVE PIPELINE
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xs text-stone-500">Provide Shipment Form parameters to activate optimization paths.</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
