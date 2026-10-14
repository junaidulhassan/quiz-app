export default function FilterBar({ search, onSearch, filters, values, onFilter, placeholder = "Search…" }) {
  return (
    <div className="tb">
      <input className="in" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholder} />
      {filters.map((filter) => (
        <select
          key={filter.name}
          value={values[filter.name] || ""}
          onChange={(event) => onFilter(filter.name, event.target.value)}
          aria-label={`All ${filter.label.toLowerCase()}`}
        >
          <option value="">{`All ${filter.label.toLowerCase()}`}</option>
          {(filter.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
