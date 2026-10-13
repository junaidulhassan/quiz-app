import { NavLink } from "react-router-dom";
import {
  ActivityIcon, AssessmentIcon, BillingIcon, DataIcon, ManagerIcon, OverviewIcon, PropertyIcon,
  ReportsIcon, SettingsIcon, ShieldIcon, SupportIcon, TenantsIcon, UsersIcon,
} from "../components/Icons.jsx";
import { SECTIONS } from "../config/sections.js";
import useAdmin from "../hooks/useAdmin.js";

const ICONS = {
  overview: OverviewIcon,
  users: UsersIcon,
  tenants: TenantsIcon,
  pms: ManagerIcon,
  props: PropertyIcon,
  assess: AssessmentIcon,
  activity: ActivityIcon,
  billing: BillingIcon,
  support: SupportIcon,
  reports: ReportsIcon,
  data: DataIcon,
  admins: ShieldIcon,
  settings: SettingsIcon,
};

const GROUPS = [
  { title: "Dashboard", keys: ["overview", "reports"] },
  { title: "People", keys: ["users", "tenants", "pms", "props"] },
  { title: "Operations", keys: ["assess", "activity", "billing", "support"] },
  { title: "System", keys: ["data", "admins", "settings"] },
];

export default function Sidebar({ open, onNavigate }) {
  const { me } = useAdmin();
  const allowed = new Set(me.permissions.view);
  const byKey = Object.fromEntries(SECTIONS.map((section) => [section.key, section]));

  return (
    <aside className={`adm-sidebar${open ? " is-open" : ""}`}>
      <div className="adm-brand">
        <img src="/logo/hyeve.png" alt="" />
        <span>Hyeve</span>
        <small>Admin</small>
      </div>
      <nav aria-label="Admin sections">
        {GROUPS.map((group) => (
          <div key={group.title} className="adm-nav-group">
            <p>{group.title}</p>
            {group.keys.map((key) => {
              const section = byKey[key];
              const Icon = ICONS[key];
              if (!allowed.has(key)) {
                return (
                  <span key={key} className="adm-nav-link is-locked" title="Not available for your role">
                    <Icon />
                    {section.label}
                  </span>
                );
              }
              return (
                <NavLink
                  key={key}
                  to={`/admin/${section.path}`}
                  onClick={onNavigate}
                  className={({ isActive }) => `adm-nav-link${isActive ? " is-active" : ""}`}
                >
                  <Icon />
                  {section.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
