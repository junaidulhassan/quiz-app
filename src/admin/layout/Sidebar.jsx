import { NavLink } from "react-router-dom";
import {
  ActivityIcon, AssessmentIcon, BillingIcon, DataIcon, ManagerIcon, NetworkIcon, OverviewIcon, PropertyIcon,
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
  netintel: NetworkIcon,
  billing: BillingIcon,
  support: SupportIcon,
  reports: ReportsIcon,
  data: DataIcon,
  admins: ShieldIcon,
  settings: SettingsIcon,
};

export default function Sidebar({ open, onNavigate, onLogout }) {
  const { me } = useAdmin();
  const allowed = new Set(me.permissions.view);

  return (
    <aside id="sb" className={open ? "open" : ""}>
      <div className="brand">
        <img src="/logo/hyeve-new-logo.png" alt="" />
        Hyeve <small>Admin</small>
      </div>
      <nav id="nav">
        {SECTIONS.map((section) => {
          const Icon = ICONS[section.key];
          if (!allowed.has(section.key)) {
            return (
              <a key={section.key} className="lock">
                <Icon />
                {section.label}
              </a>
            );
          }
          return (
            <NavLink key={section.key} to={`/admin/${section.path}`} onClick={onNavigate} className={({ isActive }) => (isActive ? "on" : "")}>
              <Icon />
              {section.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="me">
        <b>{me.username}</b>
        <div style={{ margin: "8px 0" }}>
          <span className="tag pu">{me.role}</span>
        </div>
        <button type="button" className="btn" style={{ width: "100%" }} id="out" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
