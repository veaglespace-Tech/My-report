const BACKEND_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api";

export async function POST(request) {
  try {
    const payload = await request.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${BACKEND_BASE_URL}/enquiry/send`, {
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
      const fieldErrors = body && typeof body === "object" ? body.data : null;
      const firstFieldError =
        fieldErrors && typeof fieldErrors === "object"
          ? Object.values(fieldErrors).find(Boolean)
          : null;

      return Response.json(
        {
          success: false,
          message: firstFieldError || body?.message || "Something went wrong. Please try again.",
          errors: fieldErrors || undefined,
        },
        { status: 200 }
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
      { success: false, message: isTimeout ? "Server is taking too long. Please try again." : "Unable to reach the backend server. Please make sure it is running." },
      { status: 200 }
    );
  }
}
