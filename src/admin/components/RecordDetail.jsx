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
    <Modal title={title} onClose={onClose} wide>
      <dl className="adm-detail">
        {fields.map((field) => (
          <div key={field.field}>
            <dt>{field.label}</dt>
            <dd>{renderCell(field, row[field.field])}</dd>
          </div>
        ))}
      </dl>
      <div className="adm-modal-actions">
        <button type="button" className="adm-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}
