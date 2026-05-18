const BACKEND_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8082/api";

export async function POST(request) {
  try {
    const payload = await request.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${BACKEND_BASE_URL}/contact/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text().catch(() => "");

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          message: body?.message || "Something went wrong. Please try again.",
        },
        { status: response.status || 500 }
      );
    }

    return new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/json",
      },
    });
  } catch (error) {
    const isTimeout = error?.name === "AbortError";
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
