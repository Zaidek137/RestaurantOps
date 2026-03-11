import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";

interface Option {
  value: string;
  label: string;
}

interface FuturisticSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const FuturisticSelect = ({
  label,
  options,
  value,
  onChange,
  disabled,
}: FuturisticSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`futuristic-select ${disabled ? "is-disabled" : ""}`} ref={containerRef}>
      <span className="futuristic-select__label">{label}</span>
      <button
        type="button"
        className="futuristic-select__trigger"
        onClick={() => !disabled && setIsOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="futuristic-select__value">{selectedOption?.label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="futuristic-select__chevron"
        >
          <Icon name="chevronDown" width={16} height={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="futuristic-select__dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            role="listbox"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`futuristic-select__option ${option.value === value ? "is-selected" : ""}`}
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
                {option.value === value && (
                  <motion.div
                    layoutId={`selected-${label}`}
                    className="futuristic-select__active-bg"
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
