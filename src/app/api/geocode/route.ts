import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address } = body;

    console.log('🔍 Gecoding address:', address);

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

    console.log('🌐 Fetching:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CrestLogistics/1.0'
      }
    });

    if (!response.ok) {
      console.log('❌ Geocode API error:', response.status);
      return NextResponse.json(
        { error: "Geocoding failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('📦 Geocode response:', data);

    if (data.length === 0) {
      console.log('❌ No results found for:', address);
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };

    console.log('✅ Geocode result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Geocode error:', error);
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 500 }
    );
  }
}