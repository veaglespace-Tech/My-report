import OpenAI from "openai";

const KNOWLEDGE_BASE = `ABOUT MYREPORT
MyReport Store OS is a modern store management platform for retail businesses.
It helps manage: billing, inventory, reports, customers, products, GST invoices, PDF exports, Excel exports, purchase history, revenue tracking.
Supported stores: Grocery, Clothing, Shoes, Electronics, Beauty products, Accessories.

BILLING
Users can: create GST bills, add products, add quantity, print invoices, download PDF bills, apply discounts, add notes, manage customer billing.

REPORTS
Reports: revenue, customer, product, invoice, daily, monthly, yearly.
Export formats: PDF, Excel.

CUSTOMERS
Users can: add customers, view purchase history, search customers, track total billing, view order history.

INVENTORY
Users can: add products, manage stock, update prices, track inventory, view product performance.

PLANS & PRICING
Free Trial: 7 days, Rs. 0, Starter workspace, up to 250 products.
Launch Plan: 3 months, Rs. 3000, Priority setup, Starter workspace.

SUPPORT
Email: info@veaglespace.com
Phone: +91 8237999101
Website: https://veaglespace.com`;

const SYSTEM_PROMPT = `You are "MyReport Assistant", an AI website assistant for MyReport Store OS.
Subtitle: Ask anything about your store workspace.
Status: Online.

Use the knowledge base below to answer questions about MyReport: billing, GST invoices, reports, exports (PDF/Excel), customers, inventory, products, store setup/onboarding, plans & pricing, registration/login help, and support.

Rules:
- Be concise, friendly, and actionable (step-by-step when helpful).
- If a user needs account-specific help (email, invoice id), ask for it and explain why.
- Never claim you performed actions (refunds, account changes). Offer steps and what to contact support with.
- If asked something unrelated, gently redirect back to MyReport help.

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}`;

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

function lastUserMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return messages[i].content || "";
  }
  return "";
}

function localAnswer(question) {
  const q = String(question || "").toLowerCase();

  if (q.includes("feature") || q.includes("what can") || q.includes("offer")) {
    return (
      "MyReport Store OS helps you run your store with Billing (GST invoices), Inventory, Customers, Products, and Reports. " +
      "You can export reports and invoices to PDF or Excel, track revenue, and manage day-to-day operations from one dashboard."
    );
  }

  if (q.includes("generate bill") || q.includes("create bill") || q.includes("billing") || q.includes("invoice")) {
    return (
      "To generate a bill: Billing Workspace → select/add customer → add products → enter quantity → apply discount/notes (optional) → Generate Bill → print or download the PDF invoice."
    );
  }

  if (q.includes("export") || q.includes("pdf") || q.includes("excel")) {
    return "Yes — you can export Reports in both PDF and Excel formats. Invoices/bills can also be downloaded as PDF.";
  }

  if (q.includes("customer")) {
    return "Customers: add customers, search them, and view purchase/order history. You can also track total billing per customer.";
  }

  if (q.includes("inventory") || q.includes("stock") || q.includes("product")) {
    return "Inventory: add products, update prices, manage stock levels, and track product performance from the inventory section.";
  }

  if (q.includes("pricing") || q.includes("plan") || q.includes("free trial")) {
    return (
      "Plans: Free Trial (7 days, Rs. 0, starter workspace, up to 250 products) and Launch Plan (3 months, Rs. 3000, priority setup, starter workspace)."
    );
  }

  if (q.includes("gst")) {
    return "Yes — MyReport supports GST billing. You can create GST bills/invoices from the Billing workspace and download the PDF.";
  }

  if (q.includes("support") || q.includes("contact") || q.includes("help")) {
    return "Contact support: info@veaglespace.com or +91 8237999101. You can also visit https://veaglespace.com.";
  }

  if (q.includes("register") || q.includes("signup") || q.includes("sign up") || q.includes("login") || q.includes("password")) {
    return (
      "For registration/login: use the Register flow to set up your store details and admin account. If you're stuck, tell me what step you’re on and any error message you see — I’ll guide you."
    );
  }

  return (
    "I can help with Billing, Reports/exports (PDF/Excel), Customers, Inventory, Products, GST billing, Plans & Pricing, and onboarding. " +
    "What are you trying to do in MyReport Store OS?"
  );
}

async function createChatbotSupportTicket(message) {
  try {
    await fetch(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}/support/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Chatbot User",
        email: "chatbot@myreport.com",
        phone: "",
        message,
      }),
    });
  } catch {
    // best-effort only
  }
}

export async function POST(request) {
  try {
    const { messages } = await request.json();
    const coerced = coerceMessages(messages);

    if (!process.env.OPENAI_API_KEY) {
      const userMessage = lastUserMessage(coerced);
      const answer = localAnswer(userMessage);
      if (answer.startsWith("I can help with")) {
        await createChatbotSupportTicket(userMessage);
      }
      return Response.json({ message: answer, timestamp: new Date().toISOString(), provider: "local" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...coerced,
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

