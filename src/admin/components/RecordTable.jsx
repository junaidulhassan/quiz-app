import renderCell from "./renderCell.jsx";

export default function RecordTable({ columns, rows, actions, onRowClick }) {
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.field}>{column.label}</th>
            ))}
            {actions && <th className="ad-actions-head">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={onRowClick ? "is-clickable" : ""} onClick={onRowClick ? () => onRowClick(row) : undefined}>
              {columns.map((column) => (
                <td key={column.field} className={column.strong ? "is-strong" : ""}>
                  {renderCell(column, row[column.field])}
                </td>
              ))}
              {actions && (
                <td className="ad-actions" onClick={(event) => event.stopPropagation()}>
                  {actions(row).map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className={`ad-btn is-small${action.danger ? " is-danger" : ""}`}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      title={action.disabled ? "Not permitted for your role" : undefined}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
