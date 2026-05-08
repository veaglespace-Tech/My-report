const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function POST(request) {
  try {
    const payload = await request.json();

    const response = await fetch(`${BACKEND_BASE_URL}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error?.message || "Failed to Send Message" },
      { status: 500 }
    );
  }
}

