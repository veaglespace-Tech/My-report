import { GlassPanel } from "@/components/common/GlassPanel";

export function DataTable({ columns, rows, emptyMessage = "No data available." }) {
  return (
    <GlassPanel className="max-w-full overflow-hidden">
      <div className="grid gap-3 p-4 md:hidden">
        {rows.length ? (
          rows.map((row) => {
            const key = row.id ?? row.invoiceNumber ?? row.name;
            const actionsColumn = columns.find((column) => column.key === "actions");
            const visibleColumns = columns.filter((column) => column.key !== "actions");

            return (
              <div key={key} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3">
                  {visibleColumns.map((column) => (
                    <div key={column.key} className="grid gap-1.5 sm:grid-cols-[120px_1fr] sm:gap-3">
                      <div className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                        {column.label}
                      </div>
                      <div className="text-sm text-white/82">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </div>
                    </div>
                  ))}

                  {actionsColumn ? (
                    <div className="mt-1 flex flex-wrap gap-2 sm:justify-end">
                      {actionsColumn.render ? actionsColumn.render(row[actionsColumn.key], row) : row[actionsColumn.key]}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-white/55">
            {emptyMessage}
          </div>
        )}
      </div>

      <div className="hidden w-full overflow-x-auto md:block">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-[760px] lg:min-w-full">
          <thead>
            <tr className="border-b border-white/8 bg-white/4">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-white/45 ${column.headerClassName || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id ?? row.invoiceNumber ?? row.name} className="border-b border-white/6 last:border-0">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 text-sm text-white/82 ${column.cellClassName || ""}`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-8 text-center text-sm text-white/55" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </GlassPanel>
  );
}
