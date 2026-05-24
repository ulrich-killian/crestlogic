export interface ShipmentItem {
  name: string;
  qty: string;
}

export interface HistoryItem {
  status: string;
  location: string;
  description: string;
  date: string;
}

export interface ShipmentInsights {
  suggestedCarrier: string;
  predictedTransitDays: string;
  riskAssessment: string;
  directives: string[];
  buyerDispatchScript: string;
}

export interface Shipment {
  orderId: string;
  customerName: string;
  destination: string;
  weight: string;
  dimensions: string;
  fragile: boolean;
  items: ShipmentItem[];
  status: string;
  history: HistoryItem[];
  insights?: ShipmentInsights;
  origin?: string;
  transitCheckpoint?: string;
  distanceCovered?: number;
  hoursDriven?: number;
  packageWeight?: number;
  weightUnit?: 'kg' | 'lbs';
  paymentMethod?: string;
}

export let COURIER_SHIPMENTS: Record<string, Shipment> = {
  "CR-385901-LT": {
    orderId: "CR-385901-LT",
    customerName: "Amara Diallo",
    destination: "Avenue President Kennedy, Yaoundé, Cameroon",
    weight: "480",
    dimensions: "120x80x100 cm",
    fragile: true,
    items: [
      { name: "Commercial Solar Battery Inverter Packs", qty: "10" },
      { name: "Heavy Duty Frame Rails", qty: "4" }
    ],
    status: "GATEWAY_CUSTOMS_HOLD",
    history: [
      { status: "MANIFEST_CREATED", location: "Crest Packaging Hub", description: "Cargo manifest established and verified by authorized port masters.", date: "2026-05-21 08:30 UTC" },
      { status: "DRY_BULK_SORTED", location: "Crest Packaging Hub", description: "Heavy-duty custom double-cell bubble alignment wrapping applied.", date: "2026-05-21 14:15 UTC" },
      { status: "IN_OVERLAND_TRANSIT", location: "Douala Dry Port Gateway", description: "Dispatched on Crest Heavy Freight vehicle Node 4.", date: "2026-05-22 03:00 UTC" },
      { status: "GATEWAY_CUSTOMS_HOLD", location: "Yaoundé Ingress Checkpoint", description: "Bilateral custom verification protocol initiated. Processing seals.", date: "2026-05-22 14:50 UTC" }
    ],
    insights: {
      suggestedCarrier: "Crest Regional Overland Freight (West Africa Fleet)",
      predictedTransitDays: "5 Days",
      riskAssessment: "MEDIUM",
      directives: [
        "Lithium hazmat placards verified and secured on side vectors.",
        "Double-layer anti-impact corner pads verified and locked.",
        "Maintain hold temperatures below 25°C in thermo-protective deck."
      ],
      buyerDispatchScript: `[Crest Logistics] Dispatch Notification\nAttention: Amara Diallo\nManifest Waybill: CR-385901-LT\nStatus: GATEWAY_CUSTOMS_HOLD at Yaoundé Ingress Checkpoint.\nOptimized routing has been implemented by our AI Dispatch planners.`
    }
  },
  "CR-992104-LT": {
    orderId: "CR-992104-LT",
    customerName: "Mariam Sylla",
    destination: "Cocody Boulevard, Abidjan, Ivory Coast",
    weight: "35",
    dimensions: "60x40x50 cm",
    fragile: false,
    items: [
      { name: "Professional Deep-Well Food Mixer", qty: "1" },
      { name: "Stainless Steel Stockpots", qty: "2" }
    ],
    status: "DELIVERED",
    history: [
      { status: "MANIFEST_CREATED", location: "Crest Packaging Hub", description: "Order verified.", date: "2026-05-20 09:00 UTC" },
      { status: "DRY_BULK_SORTED", location: "Crest Packaging Hub", description: "Standard cargo wrapping applied.", date: "2026-05-20 11:30 UTC" },
      { status: "IN_OVERLAND_TRANSIT", location: "Abidjan Marine Hub", description: "In-state express courier dispatched.", date: "2026-05-21 13:40 UTC" },
      { status: "DELIVERED", location: "Cocody Blvd Destination", description: "Cargo signee hand-off completed cleanly. Final manifest registry archived.", date: "2026-05-22 11:15 UTC" }
    ],
    insights: {
      suggestedCarrier: "Crest Express Courier Group",
      predictedTransitDays: "2 Days",
      riskAssessment: "LOW",
      directives: [
        "Store in default well-ventilated ambient climate warehouses.",
        "Ensure standard heavy-duty wrapping of industrial cargo pallet boards."
      ],
      buyerDispatchScript: `[Crest Logistics] Manifest Dispatch System\nAttention: Mariam Sylla\nShipment Sign-off Complete. Waybill CR-992104-LT has been legally delivered.`
    }
  }
};


if (process.env.NODE_ENV !== "production") {
  const g = global as any;
  if (!g.COURIER_SHIPMENTS) {
    g.COURIER_SHIPMENTS = COURIER_SHIPMENTS;
  } else {
    COURIER_SHIPMENTS = g.COURIER_SHIPMENTS;
  }
}
