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
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.55)" />
          <YAxis stroke="rgba(255,255,255,0.55)" />
          <Tooltip contentStyle={{ background: "#101826", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 }} />
          <Bar dataKey="profit" fill="#f7c66f" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Panel>
);
