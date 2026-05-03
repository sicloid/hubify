import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SUPPORT_BOT_SYSTEM_PROMPT } from "@/lib/support-bot-system-prompt";

const MAX_MESSAGE_CHARS = 2000;
const MAX_HISTORY_MESSAGES = 12;

type ChatMessage = { role: "user" | "assistant"; content: string };

function sanitizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const content = (item as { content?: string }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    const trimmed = content.slice(0, MAX_MESSAGE_CHARS).trim();
    if (!trimmed) continue;
    out.push({ role, content: trimmed });
  }
  if (out.length === 0) return null;
  return out.slice(-MAX_HISTORY_MESSAGES);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Destek asistanı şu an yapılandırılmadı (API anahtarı eksik)." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const messages = sanitizeMessages(
    (body as { messages?: unknown }).messages
  );
  if (!messages) {
    return NextResponse.json(
      { error: "En az bir geçerli mesaj gerekli." },
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model,
      // Gündelik yanıtların doğal çeşitlenmesi; pipeline bilgisi prompt’ta sabit.
      temperature: 0.35,
      max_tokens: 500,
      messages: [
        { role: "system", content: SUPPORT_BOT_SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "Yanıt oluşturulamadı." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[support-bot]", e);
    return NextResponse.json(
      { error: "Şu an yanıt verilemiyor. Lütfen daha sonra tekrar deneyin." },
      { status: 502 }
    );
  }
}
