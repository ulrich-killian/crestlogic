/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ManifestItem, ShipmentFormData } from "./types";

/**
 * Generates a randomized tracking ID matching the required Crest Logistics standard format
 */
export function generateTrackingId(): string {
  const segment = Math.floor(100000 + Math.random() * 900000);
  return `CR-${segment}-LT`;
}

/**
 * Beautiful default initial shipment values
 */
export const INITIAL_SHIPMENT_DATA: ShipmentFormData = {
  orderId: generateTrackingId(),
  customerName: "Amara Diallo",
  destination: "Rue de Commerce, Plateau, Abidjan, Côte d'Ivoire",
  origin: "California, USA",
  items: [
    { id: "item-1", name: "High-Power Solar Inverter Cabinets", qty: 2 },
    { id: "item-2", name: "Lithium-Ion Storage Cell Modules (LFP)", qty: 12 },
    { id: "item-3", name: "Heavy-Duty Copper Braided Busbars", qty: 45 }
  ],
  weight: 385,
  dimensions: "120x80x165 cm",
  fragile: true,
  uploadedFiles: ["wholesale_solar_invoice_049.pdf"]
};

/**
 * Template files simulating parsed data
 */
export interface InvoiceTemplate {
  fileName: string;
  customerName: string;
  destination: string;
  origin: string;
  items: ManifestItem[];
  weight: number;
  dimensions: string;
  fragile: boolean;
}

export const SAMPLE_INVOICES: Record<string, InvoiceTemplate> = {
  "medical_supplies_manifest_9a.pdf": {
    fileName: "medical_supplies_manifest_9a.pdf",
    customerName: "Dr. Kenji Tanaka",
    destination: "Liberation Avenue, Dakar, Senegal",
    origin: "Paris, France",
    items: [
      { id: "med-1", name: "Precision Refrigerated Vaccine Containers", qty: 4 },
      { id: "med-2", name: "Digital Diagnostic Ultrasound Monitor Gauges", qty: 2 },
      { id: "med-3", name: "Ultra-Fine Sterile Surgical Cannula Tubes", qty: 20 }
    ],
    weight: 95,
    dimensions: "80x60x110 cm",
    fragile: true
  },
  "industrial_motor_invoice_88.pdf": {
    fileName: "industrial_motor_invoice_88.pdf",
    customerName: "Nadia Belkacem",
    destination: "Route de l'Aeroport, Algiers, Algeria",
    origin: "Hamburg, Germany",
    items: [
      { id: "ind-1", name: "Three-Phase Asynchronous Induction Motor (22kW)", qty: 1 },
      { id: "ind-2", name: "High-Tensile Structural Tension Steel Cables", qty: 6 },
      { id: "ind-3", name: "Synthetic Lubricant Compression Oils (5L Canister)", qty: 8 }
    ],
    weight: 640,
    dimensions: "150x120x140 cm",
    fragile: false
  },
  "micro_electronics_invoice.xlsx": {
    fileName: "micro_electronics_invoice.xlsx",
    customerName: "Chen Wei",
    destination: "Industrial Technology Park, Hsinchu, Taiwan",
    origin: "San Francisco, California, USA",
    items: [
      { id: "elec-1", name: "Ultra-Thin Silicon Wafer Substrate Trays", qty: 50 },
      { id: "elec-2", name: "Antistatic Electro-Discharge Shielding Cases", qty: 15 },
      { id: "elec-3", name: "Laser Precision Soldering Micro-Flux Packs", qty: 100 }
    ],
    weight: 18,
    dimensions: "45x45x30 cm",
    fragile: true
  }
};

/**
 * Geolocation Dictionary for high-fidelity coordinate lookups
 */
export const GEO_DICTIONARY: Record<string, { lat: number; lng: number }> = {
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
  "yaoundé": { lat: 3.8480, lng: 11.5521 },
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

export function hashStringToCoordinates(str: string): { lat: number; lng: number } {
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 << 5) - hash1 + char;
    hash1 |= 0;
    hash2 = (hash2 << 7) - hash2 + char * 3;
    hash2 |= 0;
  }
  const lat = (Math.abs(hash1) % 50) + 15;
  const lng = (Math.abs(hash2) % 180) - 90;
  return { lat, lng };
}

export function getLatLng(address: string, defaultVal: { lat: number; lng: number }): { lat: number; lng: number } {
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

export function getGeodesicDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
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

export function interpolateCoordinates(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }, fraction: number): { lat: number; lng: number } {
  const lat = p1.lat + (p2.lat - p1.lat) * fraction;
  const lng = p1.lng + (p2.lng - p1.lng) * fraction;
  return { lat, lng };
}

