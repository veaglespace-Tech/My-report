import { GlassPanel } from "@/components/common/GlassPanel";

export function DataTable({ columns, rows, emptyMessage = "No data available." }) {
  return (
    <GlassPanel className="overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/8 bg-white/4">
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
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
                    <td key={column.key} className="px-5 py-4 text-sm text-white/82">
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
    </GlassPanel>
  );
}
