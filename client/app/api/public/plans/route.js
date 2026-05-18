import { NextResponse } from "next/server";

function getBackendBaseUrl() {
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
}

export async function GET() {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/public/plans`, {
      cache: "no-store",
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to load plans",
      },
      { status: 500 }
    );
  }
}
