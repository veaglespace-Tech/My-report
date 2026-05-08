import { NextResponse } from "next/server";
import { mockAdminData } from "@/lib/mockData";

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

function buildFromProducts(products) {
  if (!Array.isArray(products)) return [];
  return products
    .map((product) => ({
      name: product?.name ?? "",
      value: Number(product?.soldCount ?? product?.sales ?? product?.quantitySold ?? product?.quantity ?? 0),
      unit: product?.unit,
    }))
    .filter((item) => item.name && Number.isFinite(item.value));
}

export async function GET() {
  const fallback = normalizeTopItems(mockAdminData?.dashboard?.topSales || []);
  const backendUrl = `${getBackendBaseUrl()}/reports/top-products`;
  const productsUrl = `${getBackendBaseUrl()}/admin/products`;

  try {
    const [topRes, productsRes] = await Promise.allSettled([
      fetch(backendUrl, { cache: "no-store" }),
      fetch(productsUrl, { cache: "no-store" }),
    ]);

    const topProductsResponse = topRes.status === "fulfilled" ? topRes.value : null;
    const productsResponse = productsRes.status === "fulfilled" ? productsRes.value : null;

    const topData = topProductsResponse ? await topProductsResponse.json().catch(() => null) : null;
    const productsData = productsResponse ? await productsResponse.json().catch(() => null) : null;

    const productsItems =
      productsData?.data?.items ||
      productsData?.items ||
      productsData?.data ||
      productsData ||
      [];

    const productNames = new Set(
      Array.isArray(productsItems)
        ? productsItems.map((p) => p?.name).filter(Boolean)
        : []
    );

    const topItemsRaw = topData?.data?.items || topData?.items || topData?.data || topData || [];
    let items = normalizeTopItems(topItemsRaw);

    if (productNames.size) {
      items = items.filter((item) => productNames.has(item.name));
    }

    if (!items.length) {
      const fromProducts = buildFromProducts(productsItems);
      if (fromProducts.length) {
        return NextResponse.json({ items: fromProducts }, { status: 200 });
      }
    }

    return NextResponse.json({ items }, { status: 200 });
  } catch {
    return NextResponse.json({ items: fallback }, { status: 200 });
  }
}
