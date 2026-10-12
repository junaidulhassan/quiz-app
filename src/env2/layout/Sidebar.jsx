import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { BillingIcon, HistoryIcon, LogoutIcon, ProfileIcon, QrIcon, SearchIcon } from "../components/Icons.jsx";
import { initials } from "../utils/format.js";
import { MODES, useMode } from "./ModeContext.jsx";

const NAV_ITEMS = [
  { path: "search", label: "Search ID", Icon: SearchIcon },
  { path: "history", label: "History", Icon: HistoryIcon },
  { path: "qr-scan", label: "QR Scan", Icon: QrIcon },
  { path: "billing", label: "Billing", Icon: BillingIcon },
  { path: "profile", label: "Profile", Icon: ProfileIcon },
];

const ROLE_LABELS = { property_manager: "Property Manager", tenant: "Tenant" };

export function Brand() {
  return (
    <div className="hv-brand">
      <div className="hv-brand-icon">
        <img src="/logo/hyeve.png" alt="" />
      </div>
      <div className="hv-brand-text">
        <span className="hv-brand-name">Hyeve</span>
        <span className="hv-brand-tagline">Protect Your Space</span>
      </div>
    </div>
  );
}

export function ModeSelector({ onSelect }) {
  const mode = useMode();
  return (
    <div className="hv-mode-selector" role="tablist" aria-label="Lookup type">
      {Object.values(MODES).map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={item.key === mode.key}
          className={`hv-mode-option${item.key === mode.key ? " is-selected" : ""}`}
          onClick={() => onSelect(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function NavList({ onNavigate }) {
  const mode = useMode();
  return (
    <nav aria-label="Main">
      <ul className="hv-sidebar-nav">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <li key={path}>
            <NavLink
              to={`${mode.base}/${path}`}
              onClick={onNavigate}
              className={({ isActive }) => `hv-nav-link${isActive ? " is-active" : ""}`}
            >
              <Icon />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SidebarFooter({ onLogout }) {
  const { account } = useAuth();
  return (
    <div className="hv-sidebar-footer">
      <div className="hv-footer-avatar">{initials(account.full_name)}</div>
      <div className="hv-footer-identity">
        <span className="hv-footer-name">{account.full_name}</span>
        <span className="hv-footer-role">{ROLE_LABELS[account.role]}</span>
      </div>
      <button type="button" className="hv-footer-logout" onClick={onLogout} aria-label="Log out">
        <LogoutIcon width={18} height={18} />
      </button>
    </div>
  );
}

export default function Sidebar({ onSelectMode, onLogout }) {
  return (
    <aside className="hv-sidebar">
      <Brand />
      <hr className="hv-sidebar-divider" />
      <ModeSelector onSelect={onSelectMode} />
      <hr className="hv-sidebar-divider" />
      <NavList />
      <SidebarFooter onLogout={onLogout} />
    </aside>
  );
}
