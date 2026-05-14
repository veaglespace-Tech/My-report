import { NextResponse } from "next/server";

function getBackendBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
}

function normalizeTopItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      name: item?.name ?? item?.productName ?? item?.title ?? "",
      value: Number(item?.value ?? item?.sales ?? item?.count ?? 0),
      unit: item?.unit,
    }))
    .filter((item) => item.name && Number.isFinite(item.value));
}

export async function GET() {
  const backendUrl = `${getBackendBaseUrl()}/admin/dashboard`;

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ items: [] }, { status: response.status });
    }
    const items = normalizeTopItems(data?.data?.topSales || data?.topSales || []);
    return NextResponse.json({ items }, { status: 200 });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
