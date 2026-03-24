import { memo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export const SolutionGraphCard = memo(function SolutionGraphCard({ data }) {
  if (!data.length) {
    return null;
  }

  return (
    <section className="mt-5 rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-green-900">2D Graph</p>
      <div className="mt-3 h-64 rounded-2xl bg-green-50 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#bbf7d0" strokeDasharray="3 3" />
            <XAxis dataKey="x" stroke="#166534" />
            <YAxis stroke="#166534" />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#22c55e" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
});
