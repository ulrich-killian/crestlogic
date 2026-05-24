import { NextRequest, NextResponse } from "next/server";
import { COURIER_SHIPMENTS } from "../../../db";

export async function POST(req: NextRequest) {
  try {
    const { formData, insights } = await req.json();

    if (!formData || !formData.orderId || !formData.customerName) {
      return NextResponse.json({ error: "Missing required core waybill fields" }, { status: 400 });
    }

    const id = formData.orderId.trim().toUpperCase();
    const existing = COURIER_SHIPMENTS[id];

    let history = formData.history || [];
    if (history.length === 0) {
      history = [
        {
          status: "MANIFEST_CREATED",
          location: "Crest Logistics Main Hub",
          description: "Cargo manifest established and verified by authorized administrator.",
          date: new Date().toISOString().replace("T", " ").replace(/\..+/, "") + " UTC"
        }
      ];
    }

    COURIER_SHIPMENTS[id] = {
      ...existing,
      ...formData,
      orderId: id,
      history,
      insights: insights || existing?.insights || {
        suggestedCarrier: "DHL Supply Chain Networks",
        predictedTransitDays: "3 Days",
        riskAssessment: "LOW",
        directives: [
          "Ensure standard heavy-duty wrapping of industrial cargo pallet boards.",
          "Store in default well-ventilated ambient climate warehouses."
        ],
        buyerDispatchScript: `[Crest Logistics] Manifest Dispatch Saved\nAttention: ${formData.customerName}\nWaybill ID: ${id}\nReady for courier transit.`
      }
    };

    return NextResponse.json({ success: true, shipment: COURIER_SHIPMENTS[id] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
