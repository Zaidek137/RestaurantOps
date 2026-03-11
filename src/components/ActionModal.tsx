import { type PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";
import { Panel } from "./Panel";

interface ActionModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const ActionModal = ({ isOpen, onClose, title, subtitle, children }: ActionModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="modal-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="modal-content"
          >
            <Panel title={title} subtitle={subtitle} className="modal-panel">
              <button
                type="button"
                className="modal-close button-secondary"
                onClick={onClose}
                aria-label="Close modal"
              >
                <Icon name="close" className="button-icon" width={16} height={16} />
                <span>Cancel</span>
              </button>
              {children}
            </Panel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
