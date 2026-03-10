import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BreakdownDatum } from "../../types/domain";
import { Panel } from "../Panel";

interface ExpenseDonutChartProps {
  title: string;
  subtitle: string;
  data: BreakdownDatum[];
}

const palette = ["#ff8c6b", "#76e4c3", "#f7c66f", "#7bd0ff", "#f29dd6", "#d1ddff"];

export const ExpenseDonutChart = ({ title, subtitle, data }: ExpenseDonutChartProps) => (
  <Panel title={title} subtitle={subtitle} className="chart-panel">
    <div className="chart-wrap chart-wrap--split">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={66}
            outerRadius={96}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={entry.tone ?? palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#101826", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="legend-list">
        {data.map((entry, index) => (
          <div key={entry.label} className="legend-row">
            <span className="legend-row__dot" style={{ background: entry.tone ?? palette[index % palette.length] }} />
            <span>{entry.label}</span>
            <strong>{entry.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </div>
  </Panel>
);
