import OpenAI from "openai";

const SYSTEM_PROMPT = `You are the MyReport AI assistant embedded inside a SaaS dashboard.
You help users with:
- Pricing questions
- Registration and login help
- Customer support and troubleshooting
- Product queries and how-to
- Billing support (invoices, plans, refunds policy, payment issues)

Rules:
- Be concise and actionable.
- If you need account-specific info (email, invoice id), ask for it and explain why.
- Never claim you performed actions (refunds, account changes). Offer steps and what to contact support with.
- If the user asks for something unrelated, gently redirect to MyReport product help.`;

function coerceMessages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content : "",
    }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-20);
}

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY on server." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...coerceMessages(messages),
      ],
    });

    const content = completion.choices?.[0]?.message?.content || "";
    return Response.json({
      message: content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { error: "Chat request failed.", details: String(error?.message || error) },
      { status: 500 }
    );
  }
}

