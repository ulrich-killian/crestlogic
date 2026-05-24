/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with metadata tracking
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
    console.log("NomadPulse server: Google GenAI client initialized successfully.");
  } catch (error) {
    console.error("NomadPulse server: Failed to initialize Google GenAI client.", error);
  }
} else {
  console.log("NomadPulse server: No valid GEMINI_API_KEY, using local heuristic processing.");
}

// Fallback logic for local heuristic processing (offline/no-key gracefully)
function generateFallbackInsights(formData: any): any {
  const dest = (formData.destination || "").toLowerCase();
  const items = formData.items || [];
  const hasFragile = formData.fragile;
  const weight = Number(formData.weight) || 0;

  // Heuristic carrier assignment
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

  // Heuristic transit window
  let days = "3 Days";
  if (dest.includes("dakar") || dest.includes("abidjan")) {
    days = "5 Days";
  } else if (weight > 500) {
    days = "12 Days (Freight Ocean Container)";
  } else if (dest.includes("tokyo") || dest.includes("asia")) {
    days = "4 Days (Air Priority)";
  }

  // Heuristic risk scoring
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

  // Create customized packing directives based on manifest list
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

  // Analyze specific item attributes
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

  // Build a responsive buyer dispatch draft
  const buyerDispatchScript = `[NomadPulse Logistics] Manifest Dispatch System

Attention: ${customerName}
Tracking ID: ${orderId}

Your container order is currently in processing.
Inventory Manifest: ${itemSummary}.
Route Configuration: ${carrier} (${days} estimated route time).
Terminal Gateway: ${destination}.

Our teams have mapped optimal warehouse handling directives for item safety. Your tracking index is active.

Status: Registered and Verified.`;

  return {
    suggestedCarrier: carrier,
    predictedTransitDays: days,
    riskAssessment: risk,
    directives,
    buyerDispatchScript,
  };
}

// In-memory Shipment database for Crest Logistics
import { COURIER_SHIPMENTS } from "./src/db";

// REST Route for AI Logistics insights
app.post("/api/logistics-ai", async (req, res) => {
  const formData = req.body;
  
  if (!formData || !formData.customerName) {
    return res.status(400).json({ error: "Invalid shipment container payload" });
  }

  // Artificial timing for professional optimization experience
  const waitMs = 700;

  if (ai) {
    try {
      // Craft high-precision prompt
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
        setTimeout(() => {
          res.json(data);
        }, waitMs);
        return;
      }
    } catch (apiError) {
      console.error("NomadPulse server: Gemini route failed. Falling back to rule-engine.", apiError);
    }
  }

  // Apply beautiful deterministic fallback if Gemini doesn't capture
  const localResponse = generateFallbackInsights(formData);
  setTimeout(() => {
    res.json(localResponse);
  }, waitMs);
});

// GET endpoint to query a package by tracking ID
app.get("/api/shipments/:id", (req, res) => {
  const { id } = req.params;
  const upperId = (id || "").trim().toUpperCase();
  const shipment = COURIER_SHIPMENTS[upperId];

  if (!shipment) {
    return res.status(404).json({ error: `Verification ID ${upperId} not found in Crest database archives.` });
  }

  res.json(shipment);
});

// GET endpoint to query ALL packages
app.get("/api/shipments", (req, res) => {
  res.json(Object.values(COURIER_SHIPMENTS));
});

// DELETE endpoint to delete a package
app.delete("/api/shipments/:id", (req, res) => {
  const { id } = req.params;
  const upperId = (id || "").trim().toUpperCase();
  
  if (COURIER_SHIPMENTS[upperId]) {
    delete COURIER_SHIPMENTS[upperId];
    return res.json({ success: true, message: `Shipment ${upperId} deleted successfully.` });
  }
  
  return res.status(404).json({ error: `Shipment ${upperId} not found.` });
});

// POST endpoint to register a shipment
app.post("/api/register-shipment", (req, res) => {
  const { formData, insights } = req.body;

  if (!formData || !formData.orderId || !formData.customerName) {
    return res.status(400).json({ error: "Missing required core waybill fields" });
  }

  const id = formData.orderId.trim().toUpperCase();
  const existing = COURIER_SHIPMENTS[id];
  
  // Set up progress history
  const history = formData.history || (existing ? existing.history : [
    {
      status: "MANIFEST_CREATED",
      location: "Crest Logistics Main Hub",
      description: "Cargo manifest established and verified by authorized administrator.",
      date: new Date().toISOString().replace("T", " ").replace(/\..+/, "") + " UTC"
    }
  ]);

  const status = formData.status || (existing ? existing.status : "MANIFEST_CREATED");

  // Store inside in-memory DB
  COURIER_SHIPMENTS[id] = {
    ...formData,
    orderId: id,
    status,
    history,
    insights: insights || (existing ? existing.insights : {
      suggestedCarrier: "DHL Supply Chain Networks",
      predictedTransitDays: "3 Days",
      riskAssessment: "LOW",
      directives: [
        "Ensure standard heavy-duty wrapping of industrial cargo pallet boards.",
        "Store in default well-ventilated ambient climate warehouses."
      ],
      buyerDispatchScript: `[Crest Logistics] Manifest Dispatch Saved\nAttention: ${formData.customerName}\nWaybill ID: ${id}\nReady for courier transit.`
    })
  };

  console.log(`Crest Logistics: Shipment ${id} processed and saved successfully.`);
  res.json({ success: true, shipment: COURIER_SHIPMENTS[id] });
});

async function startServer() {
  // Vite integration middleware for asset pipelines
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Crest Logistics Server active on port ${PORT}`);
  });
}

startServer();
