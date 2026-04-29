export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel frost-line w-full max-w-xl rounded-[32px] p-10">
        <div className="mb-6 h-6 w-40 rounded-full shimmer" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card h-28 rounded-3xl p-6">
              <div className="h-full w-full rounded-2xl shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
