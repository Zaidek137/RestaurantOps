import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";

interface Action {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

interface FloatingActionMenuProps {
  actions: Action[];
}

export const FloatingActionMenu = ({ actions }: FloatingActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fab-container" ref={menuRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fab-actions"
          >
            {actions.map((action, index) => (
              <button
                key={`${action.label}-${index}`}
                className="fab-action-item"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.icon && <span className="icon">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fab-trigger button-primary"
        onClick={() => {
          if (actions.length === 1) {
            actions[0].onClick();
          } else {
            setIsOpen((current) => !current);
          }
        }}
      >
        <Icon
          name={isOpen ? "close" : "plus"}
          className="fab-icon"
          width={18}
          height={18}
        />
        {actions.length === 1 ? actions[0].label : "Actions"}
      </motion.button>
    </div>
  );
};
