import { SearchIcon } from "./Icons.jsx";

export default function FilterBar({ search, onSearch, filters, values, onFilter, onClear, placeholder = "Search…" }) {
  const active = Object.values(values).some(Boolean) || search;
  return (
    <div className="adm-filterbar">
      <label className="adm-search">
        <SearchIcon width={16} height={16} />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholder} aria-label="Search" />
      </label>
      {filters.map((filter) => (
        <select
          key={filter.name}
          value={values[filter.name] || ""}
          onChange={(event) => onFilter(filter.name, event.target.value)}
          aria-label={filter.label}
        >
          <option value="">{filter.label}: All</option>
          {(filter.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ))}
      {active && (
        <button type="button" className="adm-btn is-ghost" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
