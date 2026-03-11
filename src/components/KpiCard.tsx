import { motion } from "framer-motion";
import clsx from "clsx";

interface KpiCardProps {
  label: string;
  value: string;
  trend: number;
  tone: "emerald" | "amber" | "rose" | "sky";
}

export const KpiCard = ({ label, value, trend, tone }: KpiCardProps) => (
  <motion.article
    className={clsx("kpi-card", `kpi-card--${tone}`)}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    <span className="kpi-card__label">{label}</span>
    <div className="kpi-card__value-wrap">
      <strong className="kpi-card__value">{value}</strong>
      <span className={clsx("kpi-card__trend", { "is-negative": trend < 0 })}>
        {trend >= 0 ? "+" : ""}
        {trend.toFixed(1)}%
      </span>
    </div>
  </motion.article>
);
