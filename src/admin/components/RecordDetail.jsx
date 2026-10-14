import { humanize } from "../utils/format.js";
import Modal from "./Modal.jsx";
import renderCell from "./renderCell.jsx";

export default function RecordDetail({ title, row, columns, onClose }) {
  const known = new Set(columns.map((column) => column.field));
  const extras = Object.keys(row)
    .filter((key) => key !== "id" && !known.has(key))
    .map((key) => ({ label: humanize(key), field: key }));
  const fields = [...columns, ...extras];

  return (
    <Modal title={title} onClose={onClose}>
      <div className="kv">
        {fields.map((field) => (
          <div key={field.field}>
            <span>{field.label}</span>
            {renderCell(field, row[field.field])}
          </div>
        ))}
      </div>
      <p style={{ color: "var(--gray)", fontSize: 12 }}>
        Sensitive data (passwords, card numbers, raw assessment answers) is never shown to admins.
      </p>
      <div className="ft">
        <button type="button" className="btn" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
