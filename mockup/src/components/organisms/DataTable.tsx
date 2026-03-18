import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sticky?: boolean;
}

interface DataTableProps<T = any> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  stickyFirstColumn?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  stickyFirstColumn = true,
  emptyMessage = "데이터가 없습니다.",
  className = "",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortOrder]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-[14px] font-normal leading-[20px] text-foreground-tertiary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="sticky top-0 z-[5] bg-background-canvas">
            {columns.map((col, ci) => (
              <th
                key={col.key}
                className={`px-3 py-3 text-left text-[13px] font-semibold leading-[18px] text-foreground-secondary border-b border-stroke-inactive whitespace-nowrap
                  ${ci === 0 && stickyFirstColumn ? "sticky left-0 z-[6] bg-background-canvas" : ""}`}
                style={col.width ? { width: col.width, minWidth: col.width } : undefined}
              >
                {col.sortable !== false ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-foreground-primary transition-colors"
                  >
                    {col.header}
                    {sortKey === col.key && (
                      <Icon
                        name={sortOrder === "asc" ? "IconChevronUp" : "IconChevronDown"}
                        size={14}
                      />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, ri) => (
            <tr
              key={(row as any).id || ri}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-stroke-inactive hover:bg-overlay-hover transition-colors
                ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((col, ci) => (
                <td
                  key={col.key}
                  className={`px-3 py-3 text-[14px] font-normal leading-[20px] text-foreground-primary whitespace-nowrap
                    ${ci === 0 && stickyFirstColumn ? "sticky left-0 z-[1] bg-background-card font-semibold" : ""}`}
                >
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
