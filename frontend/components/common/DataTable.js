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
  const isScrollable = shouldPaginate || rows.length > 8;
  const scrollClass = isScrollable ? "max-h-[62vh] overflow-y-auto pr-1 scrollbar-thin" : "";

  return (
    <GlassPanel className="max-w-full overflow-hidden">
      <div className={`grid gap-3 p-4 md:hidden ${scrollClass}`}>
        {visibleRows.length ? (
          visibleRows.map((row, index) => {
            const key = rowKey(row, index);
            const actionsColumn = columns.find((column) => column.key === "actions");
            const visibleColumns = columns.filter((column) => column.key !== "actions");

            return (
              <div key={key} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:border-cyan-300/30">
                <div className="grid gap-3">
                  {visibleColumns.map((column) => (
                    <div key={column.key} className="grid gap-1.5 sm:grid-cols-[120px_1fr] sm:gap-3">
                      <div className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        {column.label}
                      </div>
                      <div className="min-w-0 break-words text-sm leading-6 text-[var(--muted-strong)]">
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
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-[var(--muted)]">
            {emptyMessage}
          </div>
        )}
      </div>

      <div className="hidden w-full overflow-x-auto md:block">
        <div className={`${isScrollable ? "max-h-[68vh]" : ""} overflow-auto scrollbar-thin`}>
          <table className="min-w-[760px] lg:min-w-full">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-white/8 bg-[color-mix(in_srgb,var(--background)_86%,transparent)] backdrop-blur-xl">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] ${column.headerClassName || ""}`}
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
                      className={`min-w-0 px-5 py-4 text-sm leading-6 text-[var(--muted-strong)] ${column.cellClassName || ""}`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-8 text-center text-sm text-[var(--muted)]" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      {shouldPaginate ? (
        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/8 px-4 py-6 sm:flex-row sm:justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
            Showing <span className="text-white/70">{visibleRows.length}</span> of <span className="text-white/70">{rows.length}</span> items
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              className="inline-flex h-10 px-4 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Prev
            </button>
            
            <div className="flex items-center gap-1.5 px-2">
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                    currentPage === pageNumber
                      ? "bg-white text-slate-950 shadow-xl shadow-white/10 scale-105"
                      : "text-white/50 hover:bg-white/8 hover:text-white"
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
              className="inline-flex h-10 px-4 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>

          <div className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 sm:block">
            Page {currentPage} / {totalPages}
          </div>
        </div>
      ) : null}
    </GlassPanel>
  );
}
