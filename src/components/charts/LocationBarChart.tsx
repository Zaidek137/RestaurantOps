import { ResponsiveContainer, Tooltip, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { LocationPerformance } from "../../types/domain";
import { Panel } from "../Panel";

interface LocationBarChartProps {
  data: LocationPerformance[];
}

export const LocationBarChart = ({ data }: LocationBarChartProps) => (
  <Panel title="Location profitability" subtitle="Operating profit by visible restaurant" className="chart-panel">
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="name" stroke="transparent" tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <YAxis stroke="transparent" tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: "var(--border)", opacity: 0.2 }}
            contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "var(--shadow-panel)", color: "var(--text)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} 
            itemStyle={{ color: "var(--text)" }}
            labelStyle={{ color: "var(--muted)", marginBottom: "4px" }}
          />
          <Bar dataKey="profit" fill="url(#barGradient)" radius={[16, 16, 16, 16]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Panel>
);
