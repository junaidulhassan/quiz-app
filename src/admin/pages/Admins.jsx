import { SECTION_BY_KEY } from "../config/sections.js";
import AuditLog from "./records/AuditLog.jsx";
import RecordsPage from "./records/RecordsPage.jsx";

export default function Admins() {
  return <RecordsPage section={SECTION_BY_KEY.admins} footer={<AuditLog />} />;
}
