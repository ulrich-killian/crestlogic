import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";


const MAX_HISTORY = 50;
const MAX_MESSAGE_CHARS = 2000;

let ai: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 },
    );
  }

  const { message, history } = body as { message?: unknown; history?: unknown };

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "message is required and must be a non-empty string." },
      { status: 400 },
    );
  }


  const historyArray = Array.isArray(history) ? history : [];


  const limitedHistory = historyArray.slice(-MAX_HISTORY);

  const contents = [
    ...limitedHistory.map((h: any) => {
      const safeSender = h && typeof h.sender === "string" ? h.sender : "model";
      const safeText = h && typeof h.text === "string" ? h.text : "";
      
      return {
        role: safeSender === "user" ? "user" : "model",
        parts: [{ text: safeText.slice(0, MAX_MESSAGE_CHARS) }],
      };
    }),
    { role: "user", parts: [{ text: message.slice(0, MAX_MESSAGE_CHARS) }] },
  ];

  let genAI: GoogleGenAI;
  try {
    genAI = getGenAI();
  } catch (err) {
    console.error("Chat route: GoogleGenAI init failed.", err);
    return NextResponse.json(
      { error: "AI service is not configured. Please contact support." },
      { status: 500 },
    );
  }

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: `You are Crest AI Dispatch Agent for Crest Logistics — a premium international shipping company.
You help customers track packages, understand shipping routes, get quotes, and answer logistics questions.
Keep responses concise and professional.
If asked for a tracking ID lookup, tell them to use the Track tab with their CR-XXXXXX-LT code.
Never make up tracking data.
When you cannot resolve an issue — such as a tracking code not found, payment disputes, or damaged cargo claims — end your response with exactly this tag on a new line: [NEEDS_HUMAN]
Otherwise respond normally without the tag.`,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error("Chat route: Gemini generateContent failed.", err);
    return NextResponse.json(
      { error: "The AI dispatch agent is temporarily unavailable. Please try again shortly." },
      { status: 502 },
    );
  }
}