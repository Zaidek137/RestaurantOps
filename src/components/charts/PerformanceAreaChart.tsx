import { ResponsiveContainer, Tooltip, Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "../../types/domain";
import { Panel } from "../Panel";

interface PerformanceAreaChartProps {
  title: string;
  subtitle: string;
  data: TrendPoint[];
}

export const PerformanceAreaChart = ({ title, subtitle, data }: PerformanceAreaChartProps) => (
  <Panel title={title} subtitle={subtitle} className="chart-panel chart-panel--wide">
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-coral)" stopOpacity={0.7} />
              <stop offset="100%" stopColor="var(--accent-coral)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="primeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-mint)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="var(--accent-mint)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="label" stroke="transparent" tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <YAxis stroke="transparent" tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "var(--shadow-panel)", color: "var(--text)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} 
            itemStyle={{ color: "var(--text)" }}
            labelStyle={{ color: "var(--muted)", marginBottom: "4px" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--accent-coral)" fill="url(#revenueFill)" strokeWidth={3} />
          <Area type="monotone" dataKey="primeCost" stroke="var(--accent-mint)" fill="url(#primeFill)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Panel>
);
