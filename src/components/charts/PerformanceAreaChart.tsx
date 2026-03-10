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
              <stop offset="0%" stopColor="#ff8c6b" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#ff8c6b" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="primeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#76e4c3" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#76e4c3" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.55)" />
          <YAxis stroke="rgba(255,255,255,0.55)" />
          <Tooltip contentStyle={{ background: "#101826", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 }} />
          <Area type="monotone" dataKey="revenue" stroke="#ff8c6b" fill="url(#revenueFill)" strokeWidth={3} />
          <Area type="monotone" dataKey="primeCost" stroke="#76e4c3" fill="url(#primeFill)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Panel>
);
