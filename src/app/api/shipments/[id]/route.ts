import { NextRequest, NextResponse } from "next/server";
import { COURIER_SHIPMENTS } from "../../../../db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const upperId = (id || "").trim().toUpperCase();
    const shipment = COURIER_SHIPMENTS[upperId];

    if (!shipment) {
      return NextResponse.json({ error: `Verification ID ${upperId} not found.` }, { status: 404 });
    }

    return NextResponse.json(shipment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const upperId = (id || "").trim().toUpperCase();

    if (COURIER_SHIPMENTS[upperId]) {
      delete COURIER_SHIPMENTS[upperId];
      return NextResponse.json({ success: true, message: `Shipment ${upperId} deleted successfully.` });
    }

    return NextResponse.json({ error: `Shipment ${upperId} not found.` }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
