/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from "react";
import { 
  Warehouse, 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Compass, 
  Ship, 
  Plane, 
  MapPin, 
  Maximize2,
  X,
  Clock,
  Sun,
  Cloud,
  CloudRain,
  Wind
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

interface Milestone {
  id: string;
  label: string;
  desc: string;
  x: number; // fallback static percentage width
  y: number; // fallback static percentage height
  icon: React.ComponentType<any>;
}

const MILESTONES: Milestone[] = [
  {
    id: "MANIFEST_CREATED",
    label: "Manifest Created",
    desc: "Crest Packing Hub",
    x: 12,
    y: 72,
    icon: Warehouse,
  },
  {
    id: "DRY_BULK_SORTED",
    label: "Dry Bulk Sorted",
    desc: "Sorting & Wrapping Center",
    x: 32,
    y: 38,
    icon: Package,
  },
  {
    id: "IN_OVERLAND_TRANSIT",
    label: "Overland Transit",
    desc: "Heavy Transit Corridor",
    x: 58,
    y: 58,
    icon: Truck,
  },
  {
    id: "GATEWAY_CUSTOMS_HOLD",
    label: "Border Check",
    desc: "Gateway Customs Hold",
    x: 78,
    y: 32,
    icon: AlertTriangle,
  },
  {
    id: "DELIVERED",
    label: "Delivered",
    desc: "Consignee Arrived",
    x: 92,
    y: 68,
    icon: CheckCircle,
  }
];

const MILESTONE_COORDS: Record<string, { lat: number; lng: number }> = {
  MANIFEST_CREATED: { lat: 4.0511, lng: 9.7679 }, // Douala Dry Port
  DRY_BULK_SORTED: { lat: 3.8016, lng: 10.1257 }, // Édéa Sorting Hub
  IN_OVERLAND_TRANSIT: { lat: 3.8562, lng: 10.8407 }, // Boumnyébel Transit Corridor
  GATEWAY_CUSTOMS_HOLD: { lat: 3.8642, lng: 11.4116 }, // Yaoundé Gateway Edge
  DELIVERED: { lat: 3.8480, lng: 11.5021 } // Yaoundé Operations Base
};

const GEO_DICTIONARY: Record<string, { lat: number; lng: number }> = {
  "california": { lat: 36.7783, lng: -119.4179 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "san francisco": { lat: 37.7749, lng: -122.4194 },
  "usa": { lat: 37.0902, lng: -95.7129 },
  "united states": { lat: 37.0902, lng: -95.7129 },
  "new york": { lat: 40.7128, lng: -74.0060 },
  "texas": { lat: 31.9686, lng: -99.9018 },
  "florida": { lat: 27.6648, lng: -81.5158 },
  "canada": { lat: 56.1304, lng: -106.3468 },
  "toronto": { lat: 43.6532, lng: -79.3832 },
  "vancouver": { lat: 49.2827, lng: -123.1207 },
  "montreal": { lat: 45.5017, lng: -73.5673 },
  "ottawa": { lat: 45.4215, lng: -75.6972 },
  "germany": { lat: 51.1657, lng: 10.4515 },
  "berlin": { lat: 52.5200, lng: 13.4050 },
  "frankfurt": { lat: 50.1109, lng: 8.6821 },
  "munich": { lat: 48.1351, lng: 11.5820 },
  "hamburg": { lat: 53.5511, lng: 9.9937 },
  "france": { lat: 46.2276, lng: 2.2137 },
  "paris": { lat: 48.8566, lng: 2.3522 },
  "marseille": { lat: 43.2965, lng: 5.3698 },
  "lyon": { lat: 45.7500, lng: 4.8500 },
  "cameroon": { lat: 7.3697, lng: 12.3547 },
  "douala": { lat: 4.0511, lng: 9.7679 },
  "yaounde": { lat: 3.8480, lng: 11.5021 },
  "yaoundé": { lat: 3.8480, lng: 11.5021 },
  "edea": { lat: 3.8016, lng: 10.1257 },
  "boumnyebel": { lat: 3.8562, lng: 10.8407 },
  "uk": { lat: 55.3781, lng: -3.4360 },
  "united kingdom": { lat: 55.3781, lng: -3.4360 },
  "london": { lat: 51.5074, lng: -0.1278 },
  "kenya": { lat: -1.2921, lng: 36.8219 },
  "mombasa": { lat: -4.0435, lng: 39.6682 },
  "nairobi": { lat: -1.2921, lng: 36.8219 },
  "japan": { lat: 36.2048, lng: 138.2529 },
  "tokyo": { lat: 35.6762, lng: 139.6503 },
  "taiwan": { lat: 23.6978, lng: 120.9605 },
  "hsinchu": { lat: 24.8138, lng: 120.9675 },
  "dakar": { lat: 14.7167, lng: -17.4677 },
  "senegal": { lat: 14.4974, lng: -14.4524 },
  "algiers": { lat: 36.7538, lng: 3.0588 },
  "algeria": { lat: 28.0339, lng: 1.6596 },
  "abidjan": { lat: 5.3600, lng: -4.0083 },
  "ivory coast": { lat: 7.5400, lng: -5.5471 },
  "cote d'ivoire": { lat: 7.5400, lng: -5.5471 },
  "côte d'ivoire": { lat: 7.5400, lng: -5.5471 }
};

function hashStringToCoordinates(str: string): { lat: number; lng: number } {
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 << 5) - hash1 + char;
    hash1 |= 0;
    hash2 = (hash2 << 7) - hash2 + char * 3;
    hash2 |= 0;
  }
  const lat = (Math.abs(hash1) % 90) - 20; // safe globally scaled lat
  const lng = (Math.abs(hash2) % 240) - 100; // safe globally scaled lng
  return { lat, lng };
}

function getLatLng(address: string, defaultVal: { lat: number; lng: number }): { lat: number; lng: number } {
  if (!address) return defaultVal;
  const normalized = address.toLowerCase();
  
  // Sort keys from longest to shortest to prevent partial matches
  const sortedKeys = Object.keys(GEO_DICTIONARY).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const coords = GEO_DICTIONARY[key];
    // Escape string for regex use
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
    if (regex.test(normalized)) {
      return coords;
    }
  }
  return hashStringToCoordinates(address);
}

function interpolate(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }, fraction: number): { lat: number; lng: number } {
  const lat = p1.lat + (p2.lat - p1.lat) * fraction;
  const lng = p1.lng + (p2.lng - p1.lng) * fraction;
  return { lat, lng };
}

function getGeodesicDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // in kilometers
}

const WEATHER_DATA: Record<string, { condition: string; temp: string; icon: React.ComponentType<any>; color: string }> = {
  MANIFEST_CREATED: { condition: "Sunny & Clear", temp: "24°C", icon: Sun, color: "text-amber-400" },
  DRY_BULK_SORTED: { condition: "Overcast Clouds", temp: "18°C", icon: Cloud, color: "text-sky-350 pointer-events-none" },
  IN_OVERLAND_TRANSIT: { condition: "Moderate Rain", temp: "14°C", icon: CloudRain, color: "text-blue-400 animate-pulse" },
  GATEWAY_CUSTOMS_HOLD: { condition: "Gusty Winds", temp: "12°C", icon: Wind, color: "text-teal-400" },
  DELIVERED: { condition: "Clear Sky", temp: "21°C", icon: Sun, color: "text-amber-400" }
};

interface TrackingMockMapProps {
  status: string;
  origin?: string;
  destination: string;
  transitCheckpoint?: string;
  carrierName?: string;
  orderId: string;
  distanceCovered?: number;
  hoursDriven?: number;
}

const API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';


function MapPolyline({ path, color, isDashed = false }: { path: google.maps.LatLngLiteral[]; color: string; isDashed?: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === "undefined" || path.length < 2) return;

    const lineSymbol = {
      path: "M 0,-1 0,1",
      strokeOpacity: 1,
      scale: 3
    };

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: isDashed ? 0 : 0.8,
      strokeWeight: 4,
      ...(isDashed && {
        icons: [{
          icon: lineSymbol,
          offset: "0",
          repeat: "16px"
        }]
      })
    });

    polyline.setMap(map);
    return () => {
      polyline.setMap(null);
    };
  }, [map, path, color, isDashed]);

  return null;
}

function FitBounds({ path }: { path: google.maps.LatLngLiteral[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === "undefined" || path.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    path.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds, {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40
    });
  }, [map, path]);

  return null;
}

export default function TrackingMockMap({ 
  status, 
  origin = "California, USA",
  destination = "Canada",
  transitCheckpoint,
  carrierName = "Crest Regional Overland Fleet",
  orderId,
  distanceCovered,
  hoursDriven
}: TrackingMockMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  

  const currentStatusIndex = useMemo(() => {
    const idx = MILESTONES.findIndex(m => m.id === status);
    return idx !== -1 ? idx : 0;
  }, [status]);

  const defaultOrigin = { lat: 4.0511, lng: 9.7679 }; // Douala
  const defaultDest = { lat: 3.8480, lng: 11.5021 };  // Yaounde

  const start = useMemo(() => getLatLng(origin, defaultOrigin), [origin]);
  const end = useMemo(() => getLatLng(destination, defaultDest), [destination]);

  const totalDistance = useMemo(() => {
    return Math.round(getGeodesicDistance(start, end));
  }, [start, end]);

  const progressPercent = useMemo(() => {
    if (status === "DELIVERED") return 100;


    if (distanceCovered !== undefined && distanceCovered >= 0) {
      if (totalDistance <= 0) return 0;
      const calculatedPercent = (distanceCovered / totalDistance) * 100;
      if (calculatedPercent > 0) {
        return Math.min(100, Math.max(0, calculatedPercent));
      }
    }
    if (hoursDriven !== undefined && hoursDriven >= 0) {
      if (totalDistance <= 0) return 0;
      const calculatedPercent = ((hoursDriven * 80) / totalDistance) * 100;
      if (calculatedPercent > 0) {
        return Math.min(100, Math.max(0, calculatedPercent));
      }
    }

    if (status === "MANIFEST_CREATED") return 0;


    switch (status) {
      case "MANIFEST_CREATED": return 0;
      case "DRY_BULK_SORTED": return 25;
      case "IN_OVERLAND_TRANSIT": return 50;
      case "GATEWAY_CUSTOMS_HOLD": return 75;
      case "DELIVERED": return 100;
      default: return 0;
    }
  }, [status, distanceCovered, hoursDriven, totalDistance]);

  const currentVehicleCoords = useMemo(() => {
    return interpolate(start, end, progressPercent / 100);
  }, [start, end, progressPercent]);


  const dynamicCoords = useMemo(() => {
    return {
      MANIFEST_CREATED: start,
      DRY_BULK_SORTED: interpolate(start, end, 0.25),
      IN_OVERLAND_TRANSIT: interpolate(start, end, 0.50),
      GATEWAY_CUSTOMS_HOLD: interpolate(start, end, 0.75),
      DELIVERED: end
    };
  }, [start, end]);


  const themeAccent = useMemo(() => {
    switch (status) {
      case "DELIVERED":
        return {
          primary: "border-emerald-600 text-emerald-600 bg-emerald-50",
          ring: "bg-emerald-500/20",
          solid: "bg-emerald-600",
          text: "text-emerald-700"
        };
      case "GATEWAY_CUSTOMS_HOLD":
        return {
          primary: "border-rose-500 text-rose-500 bg-rose-50",
          ring: "bg-rose-500/20",
          solid: "bg-rose-500",
          text: "text-rose-700"
        };
      case "IN_OVERLAND_TRANSIT":
        return {
          primary: "border-[#A35638] text-[#A35638] bg-[#FAF5E9]",
          ring: "bg-[#A35638]/20",
          solid: "bg-[#A35638]",
          text: "text-[#A35638]"
        };
      default:
        return {
          primary: "border-stone-700 text-stone-700 bg-stone-55",
          ring: "bg-stone-700/20",
          solid: "bg-stone-850",
          text: "text-[#111E19]"
        };
    }
  }, [status]);

  const CarrierVehicleIcon = useMemo(() => {
    const nameLower = carrierName.toLowerCase();
    if (nameLower.includes("marine") || nameLower.includes("ocean") || nameLower.includes("sea") || nameLower.includes("port")) {
      return Ship;
    }
    if (nameLower.includes("express") || nameLower.includes("air") || nameLower.includes("flight") || nameLower.includes("dhl")) {
      return Plane;
    }
    return Truck;
  }, [carrierName]);

  const activeNode = MILESTONES[currentStatusIndex] || MILESTONES[0];

  const weather = useMemo(() => {
    return WEATHER_DATA[activeNode.id] || WEATHER_DATA.MANIFEST_CREATED;
  }, [activeNode.id]);


  const coveredPath = useMemo(() => {
    return [start, currentVehicleCoords];
  }, [start, currentVehicleCoords]);

  const remainingPath = useMemo(() => {
    return [currentVehicleCoords, end];
  }, [currentVehicleCoords, end]);

  const fullPathCoordinates = useMemo(() => {
    return [start, end];
  }, [start, end]);


  const getRelativeXY = React.useCallback((coord: { lat: number; lng: number }) => {
    const coordsArray = [start, end];
    const latVals = coordsArray.map(c => c.lat);
    const lngVals = coordsArray.map(c => c.lng);
    const minLat = Math.min(...latVals);
    const maxLat = Math.max(...latVals);
    const minLng = Math.min(...lngVals);
    const maxLng = Math.max(...lngVals);

    const latDelta = maxLat - minLat || 1;
    const lngDelta = maxLng - minLng || 1;

    const x = 15 + 70 * ((coord.lng - minLng) / lngDelta);
    const y = 85 - 70 * ((coord.lat - minLat) / latDelta);

    return { x, y };
  }, [start, end]);

  return (
    <div id="crest_transit_map_widget" className="bg-white dark:bg-[#0c1411] border border-stone-200/60 dark:border-stone-800 shadow-3xs rounded-3xl p-5 flex flex-col gap-4 select-none overflow-hidden transition-colors">
      

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="bg-[#111E19] text-[#F7E4A1] p-1.5 rounded-lg">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="font-sans font-black text-xs uppercase tracking-wider text-[#111E19] dark:text-stone-100">
              Crest Global Transit Visualizer
            </span>
            <p className="text-[9px] font-mono text-stone-400 dark:text-stone-500 leading-none mt-0.5">
              TELEMETRY: DYNAMIC SATELLITE PLOT SYSTEM
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#121f1a] border border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-300 px-2 py-0.5 rounded-full font-mono text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE GMP ROUTE TRACKER</span>
          </div>
          {hasValidKey && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-1 bg-stone-100 hover:bg-[#A35638] dark:bg-stone-800/80 dark:hover:bg-[#A35638] hover:text-white border border-stone-300/40 dark:border-stone-700 text-[#111E19] dark:text-stone-200 px-2.5 py-1 rounded-full font-sans text-[10px] font-bold transition-all cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Expand Map</span>
            </button>
          )}
        </div>
      </div>


      <div className="relative h-64 bg-[#FAF7EE] dark:bg-[#060a08] border border-stone-200/50 dark:border-stone-900 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-center transition-colors">
        
        {!hasValidKey ? (

          <div className="relative w-full h-full bg-[#FAF7EE] dark:bg-[#080d0b] overflow-hidden flex flex-col justify-between p-3 select-none">
            

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e2d5_1px,transparent_1px),linear-gradient(to_bottom,#e5e2d5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#101714_1px,transparent_1px),linear-gradient(to_bottom,#101714_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />
            

            <div className="flex justify-between items-center z-10 p-2 bg-white/70 dark:bg-stone-900/80 backdrop-blur-xs rounded-xl border border-stone-200/50 dark:border-stone-800 shadow-3xs">
              <div className="flex items-center gap-1.5 font-mono text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A35638] animate-pulse" />
                <span className="text-stone-500 font-extrabold dark:text-stone-400">VECTOR PLOT SIMULATION</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] font-semibold text-stone-450 uppercase space-x-1">
                <span>WGS84 GEOID PREVIEW</span>
              </div>
            </div>


            <div className="flex-grow w-full relative h-[140px] flex items-center justify-center">
              

              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: '130px' }}>

                <line
                  x1={`${getRelativeXY(start).x}%`}
                  y1={`${getRelativeXY(start).y}%`}
                  x2={`${getRelativeXY(end).x}%`}
                  y2={`${getRelativeXY(end).y}%`}
                  stroke="#A35638"
                  strokeWidth="3.5"
                  className="opacity-20 transition-all duration-500"
                />
                <line
                  x1={`${getRelativeXY(start).x}%`}
                  y1={`${getRelativeXY(start).y}%`}
                  x2={`${getRelativeXY(end).x}%`}
                  y2={`${getRelativeXY(end).y}%`}
                  stroke="#A35638"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="opacity-40 transition-all duration-300"
                />


                <line
                  x1={`${getRelativeXY(start).x}%`}
                  y1={`${getRelativeXY(start).y}%`}
                  x2={`${getRelativeXY(currentVehicleCoords).x}%`}
                  y2={`${getRelativeXY(currentVehicleCoords).y}%`}
                  stroke="#10B981"
                  strokeWidth="3.5"
                  className="opacity-95 transition-all duration-500"
                />
              </svg>


              {MILESTONES.map((node, idx) => {
                const milestonePercent = idx * 25;
                const isPassed = progressPercent >= milestonePercent || status === "DELIVERED";
                const isCurrentActive = status === node.id || (progressPercent >= milestonePercent && progressPercent < milestonePercent + 25 && status !== "DELIVERED");
                const { x, y } = getRelativeXY(dynamicCoords[node.id]);

                return (
                  <div
                    key={"fallback-node-" + node.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="relative flex flex-col items-center">

                      {isCurrentActive && (
                        <div className="absolute -inset-1.5 rounded-full ring-2 ring-[#A35638] animate-ping duration-1000 scale-100" />
                      )}

                      <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border-1.5 shadow-2xs transition-all cursor-pointer ${
                        isCurrentActive 
                          ? "bg-[#111E19] border-[#A35638] text-[#F7E4A1]"
                          : isPassed
                            ? "bg-[#FAF5E9] border-[#A35638] text-[#A35638]"
                            : "bg-white border-stone-300 text-stone-400"
                      }`}>
                        <node.icon className="w-3 h-3" />
                      </div>


                      <div className="absolute top-6.5 bg-stone-900/95 dark:bg-stone-950/95 border border-stone-800 text-[8px] font-sans font-extrabold text-[#F7E4A1] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                        {node.id === status ? (
                          <span className="text-[#F7E4A1] font-black">● {node.label}</span>
                        ) : node.label}
                      </div>
                    </div>
                  </div>
                );
              })}

 
              {(() => {
                const activeCoords = currentVehicleCoords;
                const { x, y } = getRelativeXY(activeCoords);

                return (
                  <motion.div
                    className="absolute -translate-x-1/2 -translate-y-[28px] z-20 pointer-events-none"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    animate={{
                      left: `${x}%`,
                      top: `${y}%`
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 18,
                      mass: 0.9
                    }}
                  >
                    <div className="bg-[#111E19] border border-[#A35638] text-white px-2 py-1 rounded-xl shadow-md flex items-[#A35638] gap-1 text-[7px] font-black uppercase tracking-wider select-none animate-fadeIn">
                      <CarrierVehicleIcon className="w-3 h-3 text-[#F7E4A1] animate-pulse shrink-0" />
                      <div>
                        <div className="text-[5px] text-stone-400 font-mono leading-none">IN TRANSIT ({Math.round(progressPercent)}%)</div>
                        <div className="text-[#F7E4A1] font-mono whitespace-nowrap leading-none mt-0.5">{origin?.split(",")[0] || "START"} &rarr; {destination?.split(",")[0] || "END"}</div>
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#111E19] rotate-45 mx-auto -mt-1 border-r border-b border-[#A35638]/50" />
                  </motion.div>
                );
              })()}

            </div>


            <div className="z-10 py-1 px-2 pb-1.5 bg-[#FAF5E9]/90 dark:bg-stone-900/95 border border-stone-250/50 dark:border-stone-800/80 rounded-xl flex items-center justify-between text-[7px] font-sans select-none shadow-3xs backdrop-blur-xs">
              <span className="text-stone-500 font-semibold dark:text-stone-400 leading-none">
                To view real Google Maps layouts, configure a GOOGLE_MAPS_PLATFORM_KEY secret in Settings.
              </span>
              <a 
                href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                target="_blank" 
                rel="noreferrer" 
                className="underline font-black text-[#A35638] dark:text-[#F7E4A1] leading-none"
              >
                Get Key
              </a>
            </div>

          </div>
        ) : (

          <APIProvider apiKey={API_KEY} version="weekly">
            <div className="w-full h-full relative">
              <Map
                defaultCenter={{ lat: 3.92, lng: 10.65 }}
                defaultZoom={8}
                mapId="CREST_MAIN_MAP_PANEL"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                disableDefaultUI={true}
                gestureHandling="cooperative"
              >

                <FitBounds path={fullPathCoordinates} />


                <MapPolyline path={coveredPath} color="#10B981" isDashed={false} />
                <MapPolyline path={remainingPath} color="#A8A29E" isDashed={true} />

              
                {MILESTONES.map((node, idx) => {
                  const milestonePercent = idx * 25;
                  const isPassed = progressPercent >= milestonePercent || status === "DELIVERED";
                  const isCurrentActive = status === node.id || (progressPercent >= milestonePercent && progressPercent < milestonePercent + 25 && status !== "DELIVERED");
                  const coords = dynamicCoords[node.id];

                  return (
                    <AdvancedMarker key={node.id} position={coords} title={node.label}>
                      <div className="relative select-none group flex flex-col items-center justify-center cursor-pointer" style={{ width: '40px', height: '40px' }}>
                        {isCurrentActive && (
                          <div className={`absolute rounded-full -inset-0.5 ${themeAccent.ring} animate-ping duration-1000`} />
                        )}

                        <motion.div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-xs transition-all duration-300 origin-bottom ${
                            isCurrentActive 
                              ? `bg-[#111E19] dark:bg-[#FAF5E9] border-[#A35638] text-[#F7E4A1] dark:text-[#111E19] scale-110 z-20`
                              : isPassed
                                ? "bg-[#FAF5E9] dark:bg-[#121f1a] border-[#A35638] text-[#A35638] z-10"
                                : "bg-white dark:bg-[#070c0a] border-stone-300 dark:border-stone-800 text-stone-400 dark:text-stone-500 z-0"
                          }`}
                          animate={isCurrentActive ? {
                            y: [0, -9, 0, -3, 0],
                            scale: [1, 1.25, 1.15, 1.18, 1.15]
                          } : {
                            y: 0,
                            scale: 1
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeInOut",
                            times: [0, 0.3, 0.5, 0.7, 1]
                          }}
                        >
                          <node.icon className="w-3.5 h-3.5 stroke-[2.5]" />
                        </motion.div>

                 
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                          <div className="bg-stone-900 border border-stone-800 text-stone-100 text-[10px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap flex flex-col items-center">
                            <span className="font-bold">{node.label}</span>
                            <span className="text-[8px] text-stone-400 font-mono leading-none mt-0.5">{node.desc}</span>
                          </div>
                          <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 -mt-1" />
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

      
                <AdvancedMarker position={currentVehicleCoords}>
                  <div className="relative -translate-y-5 flex flex-col items-center select-none group cursor-pointer z-40">
             
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
                      <div className="bg-stone-950 border border-stone-800 text-stone-100 text-[10px] p-2 rounded-xl shadow-xl whitespace-nowrap flex flex-col gap-1 min-w-[155px] font-sans">
                        <div className="flex justify-between items-center border-b border-stone-850 pb-1 mb-1">
                          <span className="font-bold text-[#F7E4A1] uppercase tracking-wider text-[8px]">Active Telemetry ({Math.round(progressPercent)}%)</span>
                          <span className="font-mono text-[7px] text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded border border-emerald-800/40">LIVE</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-[8px] text-stone-400">
                          <span>Real Latitude:</span>
                          <span className="text-stone-200 font-bold">{currentVehicleCoords.lat.toFixed(4)}°N</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-[8px] text-stone-400">
                          <span>Real Longitude:</span>
                          <span className="text-stone-200 font-bold">{currentVehicleCoords.lng.toFixed(4)}°E</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-[8px] text-stone-400">
                          <span>Local Temp:</span>
                          <span className="text-[#F7E4A1] font-bold">{weather.temp}</span>
                        </div>
                      </div>
                      <div className="w-1.5 h-1.5 bg-stone-950 rotate-45 -mt-1 shadow-md border-r border-b border-stone-800" />
                    </div>

            
                    <div className="bg-[#111E19] border border-stone-800 text-white px-2 py-1 rounded-xl shadow-md flex items-center gap-1.5">
                      <CarrierVehicleIcon className="w-3.5 h-3.5 text-[#F7E4A1] animate-pulse" />
                      <div className="flex flex-col select-none pr-1">
                        <span className="text-[7px] font-mono text-stone-400 leading-none">VEHICLE LOG</span>
                        <span className="text-[8px] font-sans font-black text-[#F7E4A1] whitespace-nowrap uppercase tracking-wider">
                          {status === "DELIVERED" ? "ARRIVED" : `TRANSIT (${Math.round(progressPercent)}%)`}
                        </span>
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-[#111E19] rotate-45 -mt-1 shadow-xs" />
                  </div>
                </AdvancedMarker>
              </Map>
            </div>
          </APIProvider>
        )}

      </div>

   
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-stone-100 dark:border-stone-800 text-xs">
        
      
        <div className="bg-stone-50/70 dark:bg-[#121f1a]/40 p-3 rounded-2xl border border-stone-200/50 dark:border-stone-800/85">
          <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase font-bold tracking-wider">
            Consignment Origin Hub
          </span>
          <p className="font-sans font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1 cursor-help truncate" title={origin}>
            <Warehouse className="w-3.5 h-3.5 text-[#A35638]" />
            {origin.split(",")[0] || "Crest Packaging Hub"}
          </p>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans leading-none mt-0.5 block truncate" title={origin}>
            {origin.split(",").slice(1).join(",") || "Douala Dry Port Gateway, CM"}
          </span>
        </div>


        <div className="bg-stone-50/70 dark:bg-[#121f1a]/40 p-3 rounded-2xl border border-stone-200/50 dark:border-stone-800/85 flex flex-col justify-center items-center text-center">
          <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase font-bold tracking-wider">
            Transit Routing Lane
          </span>
          <p className="font-mono text-[10px] font-black text-[#A35638] tracking-widest uppercase flex items-center gap-1 mt-1">
            {orderId} 
          </p>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans leading-none mt-0.5 block">
            via {carrierName}
          </span>
        </div>

      
        <div className="bg-stone-50/70 dark:bg-[#121f1a]/40 p-3 rounded-2xl border border-stone-200/50 dark:border-stone-800/85">
          <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 uppercase font-bold tracking-wider">
            Delivery Destination Node
          </span>
          <p className="font-sans font-black text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mt-1 cursor-help truncate" title={destination}>
            <MapPin className="w-3.5 h-3.5 text-[#A35638]" />
            {destination.split(",")[0] || "Customs Site"}
          </p>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans leading-none mt-0.5 block truncate" title={destination}>
            {destination.split(",").slice(1).join(",") || "Regional Terminal"}
          </span>
        </div>

      </div>

    
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-stone-400 dark:text-stone-500 font-sans tracking-wide mt-1 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 border-t-2 border-[#10B981]" />
            <span>Passed Segment Route</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 border-t-2 border-dashed border-[#D3C9B4] dark:border-[#23352c]" />
            <span>Scheduled Segment Corridor</span>
          </div>
        </div>
        <div>
          <span>Select any map element or hover to browse logs</span>
        </div>
      </div>


      <AnimatePresence>
        {isExpanded && hasValidKey && (
          <div 
            className="fixed inset-0 z-50 bg-[#111e19]/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-hidden transition-all"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0c1411] border border-stone-200 dark:border-stone-850 rounded-[28px] w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative text-stone-800 dark:text-stone-200"
            >
              
      
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-stone-100 hover:bg-[#A35638] hover:text-white dark:bg-stone-800 dark:hover:bg-[#A35638] text-stone-600 dark:text-stone-300 transition-all cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

    
              <div className="flex-1 min-h-[40vh] md:min-h-0 bg-[#FAF7EE] dark:bg-[#060a08] relative p-6 flex flex-col border-b md:border-b-0 md:border-r border-stone-200 dark:border-stone-800">
                
          
                <div className="mb-4 pr-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-extrabold text-[#A35638] dark:text-[#F7E4A1] uppercase tracking-widest bg-[#FAF5E9] dark:bg-[#182a20] px-2.5 py-1 rounded-full border border-stone-200/50 dark:border-stone-800">
                      Telemetry Node: {orderId}
                    </span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono font-medium">| VECTORS PLOT</span>
                  </div>
                  <h4 className="text-lg font-sans font-black text-[#111E19] dark:text-stone-100 uppercase tracking-tight mt-1">
                    Full Google Maps Transit Lane
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-sans leading-relaxed mt-0.5 max-w-md">
                    Displaying actual routes, distribution complexes, check points, and real-world geographical coordinates in Cameroon.
                  </p>
                </div>

                <div className="flex-1 relative bg-white dark:bg-[#080d0b] border border-stone-200/60 dark:border-stone-850/65 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  
                  <APIProvider apiKey={API_KEY} version="weekly">
                    <div className="w-full h-full relative" style={{ height: '100%' }}>
                      <Map
                        defaultCenter={{ lat: 3.92, lng: 10.65 }}
                        defaultZoom={9}
                        mapId="CREST_EXPANDED_MODAL_MAP"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                        disableDefaultUI={false}
                        gestureHandling="greedy"
                      >

                        <FitBounds path={fullPathCoordinates} />


                        <MapPolyline path={coveredPath} color="#10B981" isDashed={false} />
                        <MapPolyline path={remainingPath} color="#A8A29E" isDashed={true} />


                        {MILESTONES.map((node, idx) => {
                          const isPassed = idx <= currentStatusIndex;
                          const isCurrentActive = idx === currentStatusIndex;
                          const coords = dynamicCoords[node.id];

                          return (
                            <AdvancedMarker key={"modal-" + node.id} position={coords} title={node.label}>
                              <div className="relative select-none group flex flex-col items-center justify-center cursor-pointer" style={{ width: '48px', height: '48px' }}>
                                {isCurrentActive && (
                                  <div className={`absolute -inset-1 rounded-full ${themeAccent.ring} animate-ping duration-1000`} />
                                )}

                                <motion.div 
                                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-300 origin-bottom ${
                                    isCurrentActive 
                                      ? `bg-[#111E19] dark:bg-[#FAF5E9] border-[#A35638] text-[#F7E4A1] dark:text-[#111E19] scale-110 z-20`
                                      : isPassed
                                        ? "bg-[#FAF5E9] dark:bg-[#121f1a] border-[#A35638] text-[#A35638] z-10"
                                        : "bg-white dark:bg-[#070c0a] border-stone-300 dark:border-stone-800 text-stone-400 dark:text-stone-500 z-0"
                                  }`}
                                  animate={isCurrentActive ? {
                                    y: [0, -11, 0, -4, 0],
                                    scale: [1, 1.3, 1.2, 1.23, 1.2]
                                  } : {
                                    y: 0,
                                    scale: 1
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    ease: "easeInOut",
                                    times: [0, 0.3, 0.5, 0.7, 1]
                                  }}
                                >
                                  <node.icon className="w-4 h-4 stroke-[2.5]" />
                                </motion.div>


                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                                  <div className="bg-stone-900 border border-stone-800 text-stone-100 text-[10px] px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap flex flex-col items-center">
                                    <span className="font-bold">{node.label}</span>
                                    <span className="text-[8px] text-stone-400 font-mono leading-none mt-0.5">{node.desc}</span>
                                  </div>
                                  <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 -mt-1" />
                                </div>
                              </div>
                            </AdvancedMarker>
                          );
                        })}


                        <AdvancedMarker position={MILESTONE_COORDS[activeNode.id]}>
                          <div className="relative -translate-y-5 flex flex-col items-center select-none group cursor-pointer z-40">
                            <div className="bg-[#111E19] border border-stone-800 text-white px-2.5 py-1.5 rounded-2xl shadow-lg flex items-center gap-2">
                              <CarrierVehicleIcon className="w-4 h-4 text-[#F7E4A1] animate-pulse" />
                              <div className="flex flex-col select-none pr-1">
                                <span className="text-[7px] font-mono text-stone-400 leading-none">TRACK COORDS</span>
                                <span className="text-[9px] font-sans font-black text-[#F7E4A1] whitespace-nowrap uppercase tracking-wider">
                                  {MILESTONE_COORDS[activeNode.id].lat.toFixed(4)}°N, {MILESTONE_COORDS[activeNode.id].lng.toFixed(4)}°E
                                </span>
                              </div>
                            </div>
                            <div className="w-1.5 h-1.5 bg-[#111E19] rotate-45 -mt-1 shadow-xs" />
                          </div>
                        </AdvancedMarker>
                      </Map>
                    </div>
                  </APIProvider>

                </div>


                <div className="mt-4 flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-400 font-sans font-medium">
                  <span>Interactive Real Google Maps Route - Dynamic Coordinates</span>
                  <span>Explore precise transport corridor legs on the Map widget directly.</span>
                </div>

              </div>


              <div className="w-full md:w-80 bg-stone-55 dark:bg-[#090e0c]/60 flex flex-col p-6 overflow-y-auto border-t md:border-t-0 border-stone-200 dark:border-stone-850">
                <div className="mb-6">
                  <span className="text-[9px] font-mono tracking-widest text-[#A35638] dark:text-[#F7E4A1] font-black uppercase">
                    Core Logging System
                  </span>
                  <h4 className="text-sm font-sans font-black text-[#111E19] dark:text-stone-100 uppercase tracking-tight mt-0.5">
                    Shipment Lifecycle Logs
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-normal mt-1 font-medium font-sans">
                    Real-time transaction check-ins recorded at regional freight terminals.
                  </p>
                </div>


                <div className="flex-1 flex flex-col gap-5 justify-start relative">
                  

                  <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-stone-200 dark:bg-stone-800 z-0" />

                  {MILESTONES.map((node, idx) => {
                    const isPassed = idx <= currentStatusIndex;
                    const isCurrentActive = idx === currentStatusIndex;
                    
                    return (
                      <div key={"step-" + node.id} className="flex gap-4 items-start relative z-10">
               
                        <div 
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 shadow-8xs transition-colors duration-300 ${
                            isCurrentActive
                              ? "bg-[#111E19] border-[#A35638] text-[#F7E4A1] dark:bg-[#FAF5E9] dark:text-[#111E19]"
                              : isPassed
                                ? "bg-[#FAF5E9] border-[#A35638] text-[#A35638] dark:bg-[#121f1a]"
                                : "bg-white border-stone-200 text-stone-300 dark:bg-[#070c0a] dark:border-stone-850"
                          }`}
                        >
                          <node.icon className="w-4 h-4" />
                        </div>


                        <div className="flex flex-col min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`font-sans font-black text-xs uppercase tracking-wider ${
                              isCurrentActive 
                                ? "text-[#A35638] dark:text-[#F7E4A1]"
                                : isPassed
                                  ? "text-stone-800 dark:text-stone-200 font-bold"
                                  : "text-stone-400 dark:text-stone-500 font-medium"
                            }`}>
                              {node.label}
                            </span>
                            {isCurrentActive && (
                              <span className="text-[7px] font-mono text-emerald-600 bg-emerald-50 dark:bg-[#121f1a] dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/85 uppercase font-black tracking-widest animate-pulse">
                                Active Node
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-[10px] leading-relaxed mt-0.5 font-sans font-medium ${
                            isPassed ? "text-stone-600 dark:text-stone-400" : "text-stone-400/80 dark:text-stone-500"
                          }`}>
                            {node.desc} &bull; Verified logs check.
                          </p>


                          {isPassed && (
                            <span className="text-[8px] font-mono text-stone-400 dark:text-stone-550 flex items-center gap-1 mt-1 font-semibold">
                              <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                              <span>2026-05-22 UTC &bull; Archival Verified</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>


                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-stone-400 dark:text-stone-500 font-mono">Assigned Carrier:</span>
                    <span className="font-sans font-black text-[#111E19] dark:text-stone-200 text-right max-w-[150px] truncate" title={carrierName}>
                      {carrierName}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-stone-400 dark:text-stone-500 font-mono">Target Destination:</span>
                    <span className="font-sans font-black text-stone-700 dark:text-stone-300 text-right max-w-[150px] truncate" title={destination}>
                      {destination.split(",")[0] || "Customs depot"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-stone-400 dark:text-stone-500 font-mono">Global Port Host:</span>
                    <span className="font-mono text-emerald-500 font-semibold">PORT 3000 SSL</span>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
