import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (error) {
    console.error("Next.js API: Failed to initialize Gemini API", error);
  }
}

function generateFallbackInsights(formData: any): any {
  const dest = (formData.destination || "").toLowerCase();
  const items = formData.items || [];
  const hasFragile = formData.fragile;
  const weight = Number(formData.weight) || 0;

  let carrier = "DHL Supply Chain Networks";
  if (dest.includes("dakar") || dest.includes("senegal") || dest.includes("abidjan") || dest.includes("ivory coast") || dest.includes("africa")) {
    carrier = "Nomad Express Cargo (West Africa Transit)";
  } else if (weight > 250) {
    carrier = "Oceanic Bridge Heavy Freight";
  } else if (hasFragile) {
    carrier = "Pulse Secured Parcel Force";
  } else if (dest.includes("paris") || dest.includes("london") || dest.includes("europe") || dest.includes("uk")) {
    carrier = "EuroPulse Overland Logistics";
  }

  let days = "3 Days";
  if (dest.includes("dakar") || dest.includes("abidjan")) {
    days = "5 Days";
  } else if (weight > 500) {
    days = "12 Days (Freight Ocean Container)";
  } else if (dest.includes("tokyo") || dest.includes("asia")) {
    days = "4 Days (Air Priority)";
  }

  let risk = "LOW";
  if (hasFragile && weight > 50) {
    risk = "MEDIUM";
  } else if (!formData.destination || items.length === 0) {
    risk = "HIGH";
  } else if (items.some((i: any) => {
    const name = (i.name || "").toLowerCase();
    return name.includes("battery") || name.includes("cell") || name.includes("acid");
  })) {
    risk = "MEDIUM";
  }

  const directives: string[] = [
    "Verify barcoded container seal integrity prior to core loading.",
    "Maintain strict cargo stacking limits: maximum 4 levels high."
  ];

  if (hasFragile) {
    directives.push("Affix high-visibility orange FRAGILE badges on all exposed crate corners.");
    directives.push("Apply custom high-density double-cell foam corner protective pads.");
  } else {
    directives.push("Ensure standard heavy-duty wrapping of industrial cargo pallet boards.");
  }

  if (weight > 100) {
    directives.push("Heavy-lift shipment alert: require mechanical loader/forklift placement.");
  }

  let hasSpecialItem = false;
  items.forEach((item: any) => {
    const itemName = (item.name || "").toLowerCase();
    if (itemName.includes("battery") || itemName.includes("lithium") || itemName.includes("cell")) {
      directives.push("Class 9 Lithium hazardous container placards are strictly required.");
      directives.push("Monitor hold temperatures: package in thermostatic zones below 25°C.");
      hasSpecialItem = true;
    } else if (itemName.includes("fluid") || itemName.includes("liquid") || itemName.includes("oil") || itemName.includes("paint")) {
      directives.push("Spill containment wrap must cover secondary product bundle crates.");
      directives.push("Ensure vertical upright structural bracing on transit flatbed boards.");
      hasSpecialItem = true;
    } else if (itemName.includes("glass") || itemName.includes("screen") || itemName.includes("panel")) {
      directives.push("Anti-impact sensor seals must be activated prior to gateway check.");
      hasSpecialItem = true;
    }
  });

  if (!hasSpecialItem) {
    directives.push("Store in default well-ventilated ambient climate warehouses.");
  }

  const customerName = formData.customerName || "Customer Recipient";
  const orderId = formData.orderId || "NP-000000-CM";
  const destination = formData.destination || "Cargo Portal Hub Entry";
  const itemSummary = items.map((i: any) => `${i.qty}x ${i.name || "Cargo Pack"}`).join(", ") || "manifest cargo items";

  const buyerDispatchScript = `[NomadPulse Logistics] Manifest Dispatch System\n\nAttention: ${customerName}\nTracking ID: ${orderId}\n\nYour container order is currently in processing.\nInventory Manifest: ${itemSummary}.\nRoute Configuration: ${carrier} (${days} estimated route time).\nTerminal Gateway: ${destination}.\n\nOur teams have mapped optimal warehouse handling directives for item safety. Your tracking index is active.\n\nStatus: Registered and Verified.`;

  return {
    suggestedCarrier: carrier,
    predictedTransitDays: days,
    riskAssessment: risk,
    directives,
    buyerDispatchScript,
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    if (!formData || !formData.customerName) {
      return NextResponse.json({ error: "Invalid shipment container payload" }, { status: 400 });
    }

    if (ai) {
      try {
        const systemInstruction = `You are the core AI routing optimization agent for 'Crest Logistics', a premium, elegant corporate logistics platform (creams, warm gold, deep charcoal brand colors).
Analyze the shipment and return localized, smart routing statistics, hazard risk classifications (LOW, MEDIUM, HIGH), customized warehouse packing/handling directives, and a localized client update draft.
Always structure your output exactly according to the schema provided.`;

        const prompt = `Provide logistics insights for current container manifest:
Customer: ${formData.customerName}
ID Code: ${formData.orderId}
Terminal Address: ${formData.destination}
Cargo Gross Weight: ${formData.weight} kg
Outer Dimensions: ${formData.dimensions}
Fragile cargo rating: ${formData.fragile ? "YES (HIGH PRIORITY FRAGILE SPECIALIST HANDLING REQUIRED)" : "NO (CONVENTIONAL BULK FREIGHT)"}
Manifest Listings:
${JSON.stringify(formData.items)}

Output customized warehouse containment guides, courier route schedules, and dispatch notes directly relevant to these items.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestedCarrier: {
                  type: Type.STRING,
                  description: "Name of recommended professional courier network or cargo line.",
                },
                predictedTransitDays: {
                  type: Type.STRING,
                  description: "Estimated transport timeline, e.g., '3 Days' or '5 Days (Ocean)'.",
                },
                riskAssessment: {
                  type: Type.STRING,
                  description: "Hazard and breakage tier, either 'LOW', 'MEDIUM', or 'HIGH'.",
                },
                directives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Precise point-by-point packing handling steps based on item manifest and fragile level.",
                },
                buyerDispatchScript: {
                  type: Type.STRING,
                  description: "Ready-to-copy client notifications formatted beautifully in layout.",
                },
              },
              required: [
                "suggestedCarrier",
                "predictedTransitDays",
                "riskAssessment",
                "directives",
                "buyerDispatchScript",
              ],
            },
          },
        });

        const responseText = response.text;
        if (responseText) {
          const data = JSON.parse(responseText.trim());
          return NextResponse.json(data);
        }
      } catch (apiError) {
        console.error("Gemini model execution failed inside Next.js, running rule-based resolver:", apiError);
      }
    }

    const fallback = generateFallbackInsights(formData);
    return NextResponse.json(fallback);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
