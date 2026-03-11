import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { Icon } from "./Icon";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
          scale: theme === "dark" ? 1 : 0.85,
        }}
        transition={{ duration: 0.3, ease: "backOut" }}
      >
        <Icon name={theme === "dark" ? "moon" : "sun"} width={18} height={18} />
      </motion.div>
    </button>
  );
};
