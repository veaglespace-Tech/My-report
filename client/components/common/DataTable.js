"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
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
  const scrollClass = isScrollable ? "max-h-[430px] overflow-y-scroll pr-1 scrollbar-thin" : "";
  const tableScrollClass = isScrollable ? "max-h-[470px] overflow-x-auto overflow-y-scroll scrollbar-thin" : "overflow-x-auto";

  return (
    <GlassPanel className="max-w-full overflow-hidden border-base-300/70 bg-base-100/85">
      <div className={`grid gap-3 p-4 md:hidden ${scrollClass}`}>
        {visibleRows.length ? (
          visibleRows.map((row, index) => {
            const key = rowKey(row, index);
            const actionsColumn = columns.find((column) => column.key === "actions");
            const visibleColumns = columns.filter((column) => column.key !== "actions");

            return (
              <div key={key} className="card card-compact border border-base-300 bg-base-100 shadow-sm transition hover:border-primary/35 hover:shadow-md">
                <div className="card-body gap-3">
                  {visibleColumns.map((column) => (
                    <div key={column.key} className="grid gap-1.5 sm:grid-cols-[120px_1fr] sm:gap-3">
                      <div className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/55">
                        {column.label}
                      </div>
                      <div className="min-w-0 break-words text-sm leading-6 text-base-content/85">
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
          <div className="card border border-dashed border-base-300 bg-base-200/60 px-5 py-8 text-center text-sm text-base-content/60">
            <Inbox className="mx-auto mb-3 h-8 w-8 text-base-content/35" />
            <span>{emptyMessage}</span>
          </div>
        )}
      </div>

      <div className="hidden w-full overflow-x-auto md:block">
        <div className={tableScrollClass}>
          <table className="table table-zebra min-w-[760px] lg:min-w-full">
          <thead>
            <tr className="sticky top-0 z-10 bg-base-200/95 text-base-content backdrop-blur-xl">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60 ${column.headerClassName || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? (
              visibleRows.map((row, index) => (
                <tr key={rowKey(row, index)} className="border-b border-base-300/50 last:border-0 hover:bg-primary/5">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`min-w-0 px-5 py-4 text-sm leading-6 text-base-content/85 ${column.cellClassName || ""}`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-base-content/60" colSpan={columns.length}>
                  <Inbox className="mx-auto mb-3 h-8 w-8 text-base-content/35" />
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      {shouldPaginate ? (
        <div className="flex flex-col items-center justify-center gap-4 border-t border-base-300/70 bg-base-100/70 px-4 py-5 sm:flex-row sm:justify-between">
          <div className="badge badge-outline border-base-300 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/65">
            Showing <span className="text-base-content">{visibleRows.length}</span> of{" "}
            <span className="text-base-content">{rows.length}</span>
          </div>

          <div className="join max-w-full overflow-x-auto px-1 pb-1 scrollbar-thin">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              className="btn btn-sm join-item"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <div className="join">
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`btn btn-sm join-item w-10 ${currentPage === pageNumber ? "btn-primary" : "btn-ghost"}`}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
              className="btn btn-sm join-item"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-base-content/55 sm:block">
            Page {currentPage} / {totalPages}
          </div>
        </div>
      ) : null}
    </GlassPanel>
  );
}
