import { NavLink } from "react-router-dom";
import LogoMark from "../components/lookup/LogoMark.jsx";
import { BillingIcon, BuildingIcon, HistoryIcon, LogoutIcon, ProfileIcon, QrScanIcon, SearchIdIcon } from "../components/LookupIcons.jsx";
import useAuth from "../hooks/useAuth.js";
import { MODES, useMode } from "./ModeContext.jsx";

const NAV_ITEMS = [
  { path: "search", label: "Search ID", Icon: SearchIdIcon },
  { path: "history", label: "History", Icon: HistoryIcon },
  { path: "qr-scan", label: "QR Scan", Icon: QrScanIcon },
  { path: "billing", label: "Billing", Icon: BillingIcon },
  { path: "profile", label: "Profile", Icon: ProfileIcon },
];

const ROLE_LABELS = { property_manager: "Property Manager", tenant: "Tenant" };

export function ModeSelector({ onSelect }) {
  const mode = useMode();
  return (
    <div className="mode-selector" role="group" aria-label="Lookup type">
      {Object.values(MODES).map((item) => (
        <button
          key={item.key}
          type="button"
          className={`mode-option${item.key === mode.key ? " is-selected" : ""}`}
          aria-pressed={item.key === mode.key}
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
    <nav aria-label="Primary">
      <ul className="sidebar-nav">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <li key={path} className="nav-item">
            <NavLink
              to={`${mode.base}/${path}`}
              onClick={onNavigate}
              className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
            >
              <Icon />
              <span>{label}</span>
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
    <div className="sidebar-footer">
      <div className="footer-avatar">
        <BuildingIcon />
      </div>
      <div className="footer-identity">
        <span className="footer-name">{account.full_name}</span>
        <span className="footer-role">{ROLE_LABELS[account.role]}</span>
      </div>
      <button type="button" className="footer-logout" onClick={onLogout} aria-label="Log out">
        <LogoutIcon />
      </button>
    </div>
  );
}

export default function Sidebar({ onSelectMode, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <LogoMark />
        </div>
        <div className="brand-text">
          <span className="brand-name">Hyeve</span>
          <span className="brand-tagline">Protect Your Space</span>
        </div>
      </div>

      <hr className="sidebar-divider" />

      <ModeSelector onSelect={onSelectMode} />

      <hr className="sidebar-divider" />

      <NavList />

      <SidebarFooter onLogout={onLogout} />
    </aside>
  );
}
