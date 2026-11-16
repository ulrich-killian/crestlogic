import { NextRequest, NextResponse } from "next/server";
import { upsertShipment, getShipmentById } from "../../../db";

export async function POST(req: NextRequest) {
  try {
    const { formData, insights } = await req.json();

    if (!formData || !formData.orderId || !formData.customerName) {
      return NextResponse.json(
        { error: "Missing required core waybill fields" },
        { status: 400 }
      );
    }

    const id = formData.orderId.trim().toUpperCase();

    // ============================================
    // STEP 1: Get origin and destination from formData
    // ============================================
    const { origin, destination } = formData;

    console.log('📍 REGISTER SHIPMENT - Input:');
    console.log('Origin:', origin);
    console.log('Destination:', destination);

    let originCoords = null;
    let destCoords = null;

    // ============================================
    // STEP 2: Geocode both addresses
    // ============================================
    if (origin) {
      try {
        console.log('🌐 Geocoding origin:', origin);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: origin })
          }
        );
        const data = await response.json();
        console.log('📦 Origin geocode response:', data);
        if (data.lat && data.lng) {
          originCoords = { lat: data.lat, lng: data.lng };
          console.log('✅ Origin coords set:', originCoords);
        } else {
          console.log('❌ Origin geocode failed - no lat/lng in response');
        }
      } catch (error) {
        console.error('Failed to geocode origin:', error);
      }
    }

    if (destination) {
      try {
        console.log('🌐 Geocoding destination:', destination);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/geocode`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: destination })
          }
        );
        const data = await response.json();
        console.log('📦 Destination geocode response:', data);
        if (data.lat && data.lng) {
          destCoords = { lat: data.lat, lng: data.lng };
          console.log('✅ Destination coords set:', destCoords);
        } else {
          console.log('❌ Destination geocode failed - no lat/lng in response');
        }
      } catch (error) {
        console.error('Failed to geocode destination:', error);
      }
    }

    const existing = await getShipmentById(id);

    let history = formData.history || [];
    if (history.length === 0) {
      history = existing?.history || [
        {
          status: "MANIFEST_CREATED",
          location: "Crest Logistics Main Hub",
          description: "Cargo manifest established and verified by authorized administrator.",
          date: new Date().toISOString().replace("T", " ").replace(/\..+/, "") + " UTC",
        },
      ];
    }

    // ============================================
    // STEP 3: Save shipment with coordinates
    // ============================================
    const shipmentData = {
      ...existing,
      ...formData,
      orderId: id,
      history,
      originCoords: originCoords || existing?.originCoords || null,
      destCoords: destCoords || existing?.destCoords || null,
      insights: insights || existing?.insights || {
        suggestedCarrier: "DHL Supply Chain Networks",
        predictedTransitDays: "3 Days",
        riskAssessment: "LOW",
        directives: [
          "Ensure standard heavy-duty wrapping of industrial cargo pallet boards.",
          "Store in default well-ventilated ambient climate warehouses.",
        ],
        buyerDispatchScript: `[Crest Logistics] Manifest Dispatch Saved\nAttention: ${formData.customerName}\nWaybill ID: ${id}\nReady for courier transit.`,
      },
    };

    console.log('💾 Saving shipment with:');
    console.log('originCoords:', shipmentData.originCoords);
    console.log('destCoords:', shipmentData.destCoords);

    const shipment = await upsertShipment(shipmentData);

    console.log(' Shipment saved:', shipment.orderId);

    return NextResponse.json({ success: true, shipment });
  } catch (err: any) {
    console.error("POST /api/register-shipment error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}