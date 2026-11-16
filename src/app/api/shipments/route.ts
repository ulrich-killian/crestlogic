import { NextResponse } from "next/server";
import { getAllShipments, seedIfEmpty } from "../../../db";

export async function GET() {
  try {
    await seedIfEmpty();
    const shipments = await getAllShipments();
    return NextResponse.json(shipments);
  } catch (err: any) {
    console.error("GET /api/shipments error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
