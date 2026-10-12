import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import { LogoutIcon, MenuIcon, SearchIcon } from "../components/Icons.jsx";
import useAdmin from "../hooks/useAdmin.js";

export default function Topbar({ onMenu }) {
  const { me, signOut } = useAdmin();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const canSearch = me.permissions.view.includes("users");

  const submit = (event) => {
    event.preventDefault();
    const value = term.trim();
    if (!value) return;
    navigate(`/admin/users?q=${encodeURIComponent(value)}`);
    setTerm("");
  };

  return (
    <header className="ad-topbar">
      <button type="button" className="ad-icon-btn ad-menu-btn" onClick={onMenu} aria-label="Open menu">
        <MenuIcon />
      </button>
      {canSearch && (
        <form className="ad-global-search" onSubmit={submit} role="search">
          <SearchIcon width={16} height={16} />
          <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search users by name, email or Trust ID…" aria-label="Search users" />
        </form>
      )}
      <div className="ad-topbar-end">
        <div className="ad-me">
          <span>{me.username}</span>
          <Badge value={me.role} tone="purple" />
        </div>
        <button type="button" className="ad-icon-btn is-danger" onClick={signOut} aria-label="Log out" title="Log out">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}
