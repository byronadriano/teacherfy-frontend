import React, { useState, useRef, useEffect } from "react";

function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close the menu if clicked outside of the dropdown
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const selectOption = (opt) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="dropdown-toggle"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {label}: {value || "Select..."}
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox" tabIndex="-1">
          {options.map((opt) => (
            <li key={opt}>
              <label className="dropdown-option">
                <input
                  type="radio"
                  name={label}
                  value={opt}
                  checked={value === opt}
                  onChange={() => selectOption(opt)}
                />
                {opt}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
