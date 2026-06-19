import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MAX_HISTORY_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;


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

interface ChatHistoryEntry {
  sender: "user" | "bot";
  text: string;
}

function isValidHistoryEntry(entry: unknown): entry is ChatHistoryEntry {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    (e.sender === "user" || e.sender === "bot") &&
    typeof e.text === "string" &&
    e.text.length > 0
  );
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

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  if (history !== undefined && !Array.isArray(history)) {
    return NextResponse.json(
      { error: "history must be an array if provided." },
      { status: 400 },
    );
  }

  const safeHistory: ChatHistoryEntry[] = Array.isArray(history)
    ? history.filter(isValidHistoryEntry)
    : [];

  if (safeHistory.length > MAX_HISTORY_LENGTH) {
    return NextResponse.json(
      { error: `history must contain ${MAX_HISTORY_LENGTH} entries or fewer.` },
      { status: 400 },
    );
  }

  const contents = [
    ...safeHistory.map((h) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: message }] },
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