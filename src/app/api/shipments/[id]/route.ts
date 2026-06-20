import { NextRequest, NextResponse } from "next/server";
import { getShipmentById, deleteShipment } from "../../../../db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const shipment = await getShipmentById(id);

    if (!shipment) {
      return NextResponse.json(
        { error: `Verification ID ${id.toUpperCase()} not found in Crest database archives.` },
        { status: 404 }
      );
    }

    console.log('📦 SHIPMENT RETRIEVED:');
    console.log('Order ID:', shipment.orderId);
    console.log('OriginCoords:', shipment.originCoords);
    console.log('DestCoords:', shipment.destCoords);

    return NextResponse.json(shipment);
  } catch (err: any) {
    console.error('❌ GET /api/shipments/[id] error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteShipment(id);

    if (!deleted) {
      return NextResponse.json(
        { error: `Shipment ${id.toUpperCase()} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Shipment ${id.toUpperCase()} deleted successfully.`,
    });
  } catch (err: any) {
    console.error("DELETE /api/shipments/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
