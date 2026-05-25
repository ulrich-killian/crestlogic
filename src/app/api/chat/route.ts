import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  const contents = [
    ...history.map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await ai.models.generateContent({
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
}
