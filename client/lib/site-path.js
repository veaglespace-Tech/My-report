const normalizedBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

export function withBasePath(pathname) {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  if (!normalizedBasePath) {
    return pathname;
  }

  return `${normalizedBasePath}${pathname}`;
}
