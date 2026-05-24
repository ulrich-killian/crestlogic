import { NextResponse } from "next/server";
import { COURIER_SHIPMENTS } from "../../../db";

export async function GET() {
  return NextResponse.json(Object.values(COURIER_SHIPMENTS));
}
