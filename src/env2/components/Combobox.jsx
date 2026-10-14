import { useMemo, useState } from "react";
import { ChevronDownIcon } from "./AuthIcons.jsx";

export function SearchableCombobox({ id, ariaLabel, options, value, onSelect, placeholder, disabled = false, emptyLabel = "No matches", invalid }) {
  const [draft, setDraft] = useState(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [active, setActive] = useState(-1);
  const text = draft ?? value;

  const listId = `${id}-listbox`;
  const visible = useMemo(
    () => (filter ? options.filter((option) => option.toLowerCase().includes(filter.toLowerCase())) : options),
    [options, filter]
  );

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const openList = (nextFilter) => {
    setFilter(nextFilter);
    setActive(-1);
    setOpen(true);
  };

  const choose = (option) => {
    setDraft(null);
    close();
    onSelect(option);
  };

  const onKeyDown = (event) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      openList(text);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, visible.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && visible[active]) choose(visible[active]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      close();
    }
  };

  return (
    <div className="combobox">
      <input
        type="text"
        className="combobox-input"
        id={id}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        disabled={disabled}
        value={text}
        onFocus={() => !disabled && openList(text === value ? "" : text)}
        onChange={(event) => {
          setDraft(event.target.value);
          if (event.target.value !== value) onSelect("");
          openList(event.target.value);
        }}
        onKeyDown={onKeyDown}
        onBlur={() =>
          window.setTimeout(() => {
            setDraft(null);
            close();
          }, 0)
        }
      />
      <span className="combobox-arrow" aria-hidden="true">
        <ChevronDownIcon />
      </span>
      <ul className="combobox-list" id={listId} role="listbox" aria-label={ariaLabel} hidden={!open}>
        {visible.length === 0 && <li className="combobox-empty">{emptyLabel}</li>}
        {visible.map((option, index) => (
          <li
            key={option}
            id={`${id}-option-${index}`}
            className={`combobox-option${option === value ? " is-selected" : ""}${index === active ? " is-active" : ""}`}
            role="option"
            aria-selected={option === value}
            ref={(node) => index === active && node?.scrollIntoView({ block: "nearest" })}
            onMouseDown={(event) => {
              event.preventDefault();
              choose(option);
            }}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SimpleDropdown({ id, ariaLabel, options, value, onSelect, placeholder, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = `${id}-listbox`;
  const selected = options.find((option) => option.value === value);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    setActive(options.findIndex((option) => option.value === value));
  };

  const choose = (option) => {
    onSelect(option.value);
    close();
  };

  const onKeyDown = (event) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (active >= 0) choose(options[active]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      close();
    }
  };

  return (
    <div className="combobox">
      <button
        type="button"
        className={`combobox-input combobox-trigger${selected ? "" : " is-placeholder"}`}
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        onBlur={() => window.setTimeout(close, 0)}
      >
        {selected ? selected.label : placeholder}
      </button>
      <span className="combobox-arrow" aria-hidden="true">
        <ChevronDownIcon />
      </span>
      <ul className="combobox-list" id={listId} role="listbox" aria-label={ariaLabel} hidden={!open}>
        {options.map((option, index) => (
          <li
            key={option.value}
            id={`${id}-option-${index}`}
            className={`combobox-option${option.value === value ? " is-selected" : ""}${index === active ? " is-active" : ""}`}
            role="option"
            aria-selected={option.value === value}
            onMouseDown={(event) => {
              event.preventDefault();
              choose(option);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
