import { useState, type PropsWithChildren, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Panel } from "./Panel";

interface ExpandableFormProps extends PropsWithChildren {
  buttonText: string | ReactNode;
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
}

export const ExpandableForm = ({ buttonText, icon, title, subtitle, children }: ExpandableFormProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="expandable-form-container">
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          type="button"
          onClick={() => setIsOpen(true)}
          className="button-primary expandable-form__trigger"
        >
          {icon && <span className="expandable-form__icon">{icon}</span>}
          {buttonText}
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="expandable-form__content"
          >
            <Panel title={title} subtitle={subtitle} className="expandable-form__panel">
              <button 
                type="button" 
                className="expandable-form__close button-secondary"
                onClick={() => setIsOpen(false)}
                aria-label="Close form"
              >
                ✕ Cancel
              </button>
              {children}
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
