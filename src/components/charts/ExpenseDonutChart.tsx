import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BreakdownDatum } from "../../types/domain";
import { Panel } from "../Panel";

interface ExpenseDonutChartProps {
  title: string;
  subtitle: string;
  data: BreakdownDatum[];
}

// Map the palette to CSS variables so it reacts strictly to theming updates.
const palette = ["var(--accent-coral)", "var(--accent-mint)", "var(--accent-gold)", "var(--accent-sky)", "var(--accent-blush)", "#d1ddff"];

export const ExpenseDonutChart = ({ title, subtitle, data }: ExpenseDonutChartProps) => {
  return (
    <Panel title={title} subtitle={subtitle} className="chart-panel">
      <div className="chart-wrap chart-wrap--split">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={8}
              stroke="transparent"
              strokeWidth={0}
              cornerRadius={12}
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={entry.tone ?? palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "var(--shadow-panel)", color: "var(--text)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} 
              itemStyle={{ color: "var(--text)" }}
              labelStyle={{ color: "var(--muted)", marginBottom: "4px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="legend-list">
          {data.map((entry, index) => (
            <div key={entry.label} className="legend-row">
              <span className="legend-row__dot" style={{ background: entry.tone ?? palette[index % palette.length] }} />
              <span style={{ color: "var(--text)" }}>{entry.label}</span>
              <strong style={{ color: "var(--text)" }}>{entry.value.toLocaleString()}</strong>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};
