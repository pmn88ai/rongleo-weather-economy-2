import type { JsonObject } from "@/lib/types";

export interface TableColumn {
  key: string;
  label: string;
  render: (row: JsonObject) => string;
  align?: "left" | "right";
  primary?: boolean;
}

interface ResponsiveTableProps {
  rows: JsonObject[];
  columns: TableColumn[];
  limit?: number;
  note?: string;
  rowKey?: (row: JsonObject, index: number) => string;
}

export function ResponsiveTable({ rows, columns, limit = 20, note, rowKey }: ResponsiveTableProps) {
  const shown = rows.slice(0, limit);
  const primary = columns.find((column) => column.primary) ?? columns[0];
  const secondary = columns.filter((column) => column !== primary);

  return (
    <div>
      <div className="table-scroll hidden pb-1 sm:block">
        <table className="w-full min-w-[540px] border-collapse text-left text-[13px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--app-border)" }}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-wide ${
                    column.align === "right" ? "text-right" : "text-left"
                  }`}
                  style={{ color: "var(--app-muted)" }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, index) => (
              <tr
                key={rowKey ? rowKey(row, index) : index}
                style={{ borderBottom: "1px solid var(--app-border)" }}
                className="align-top"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-2 py-2.5 ${column.align === "right" ? "text-right tabular-nums" : "text-left"} ${
                      column.primary ? "font-semibold" : ""
                    }`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2.5 sm:hidden">
        {shown.map((row, index) => (
          <li
            key={rowKey ? rowKey(row, index) : index}
            className="rounded-xl border p-3"
            style={{ borderColor: "var(--app-border)", background: "var(--app-surface-2)" }}
          >
            <p className="text-[15px] font-semibold leading-snug">{primary.render(row)}</p>
            {secondary.length > 0 && (
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                {secondary.map((column) => (
                  <div key={column.key} className={`min-w-0 ${column.align === "right" ? "text-right" : ""}`}>
                    <dt className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--app-muted)" }}>
                      {column.label}
                    </dt>
                    <dd className="break-words text-[13px] font-medium tabular-nums">{column.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>

      {(rows.length > limit || note) && (
        <p className="mt-2.5 text-[11.5px] leading-relaxed" style={{ color: "var(--app-muted)" }}>
          {rows.length > limit ? `Hiển thị ${limit}/${rows.length} dòng. ` : ""}
          {note ?? ""}
        </p>
      )}
    </div>
  );
}
