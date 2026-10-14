import renderCell from "./renderCell.jsx";

export default function RecordTable({ columns, rows, actions, onRowClick }) {
  return (
    <div className="tw">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.field}>{column.label}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              data-row={onRowClick ? "" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (event) => event.key === "Enter" && event.target === event.currentTarget && onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.field}>{renderCell(column, row[column.field])}</td>
              ))}
              {actions && (
                <td onClick={(event) => event.stopPropagation()}>
                  <div className="acts">
                    {actions(row).map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        className={`btn sm${action.danger ? " dg" : ""}`}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        title={action.disabled ? "Not permitted for your role" : undefined}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
