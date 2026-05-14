"use client";

import { useMemo, useState } from "react";
import { GlassPanel } from "@/components/common/GlassPanel";

export function DataTable({ columns, rows, emptyMessage = "No data available.", pageSize = null }) {
  const [page, setPage] = useState(1);
  const shouldPaginate = Number(pageSize) > 0 && rows.length > Number(pageSize);
  const totalPages = shouldPaginate ? Math.ceil(rows.length / Number(pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const visibleRows = shouldPaginate
    ? rows.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize))
    : rows;
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  const rowKey = (row, index) => row.id ?? row.invoiceNumber ?? row.name ?? `${currentPage}-${index}`;

  return (
    <GlassPanel className="max-w-full overflow-hidden">
      <div className="grid gap-3 p-4 md:hidden">
        {visibleRows.length ? (
          visibleRows.map((row, index) => {
            const key = rowKey(row, index);
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
            {visibleRows.length ? (
              visibleRows.map((row, index) => (
                <tr key={rowKey(row, index)} className="border-b border-white/6 last:border-0">
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
      {shouldPaginate ? (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/8 px-4 py-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Previous
          </button>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                  currentPage === pageNumber
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </div>
      ) : null}
    </GlassPanel>
  );
}
