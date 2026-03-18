import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendChartProps {
  data: Array<Record<string, any>>;
  type?: "line" | "bar" | "composite";
  period?: "7d" | "30d" | "90d";
  competitors?: Array<{ name: string; color: string; dataKey: string }>;
  showCompetitors?: boolean;
  className?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  type = "line",
  competitors,
  showCompetitors = false,
  className = "",
}) => {
  const [activePeriod, setActivePeriod] = useState<"7d" | "30d">("30d");
  const periods = ["7d", "30d"] as const;

  const slicedData = React.useMemo(() => {
    const len = activePeriod === "7d" ? 7 : 30;
    return data.slice(-len);
  }, [data, activePeriod]);

  return (
    <div className={`bg-background-card rounded-lg shadow-1 p-4 ${className}`}>
      <div className="flex items-center justify-end gap-1 mb-4">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setActivePeriod(p)}
            className={`px-3 py-1 rounded text-[13px] font-semibold leading-[18px] cursor-pointer transition-colors
              ${activePeriod === p
                ? "bg-key-background2 text-key-foreground2"
                : "text-foreground-tertiary hover:text-foreground-secondary"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {type === "bar" ? (
          <BarChart data={slicedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999999" }} />
            <YAxis tick={{ fontSize: 11, fill: "#999999" }} />
            <Tooltip />
            <Bar dataKey="downloads" fill="#ed5000" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={slicedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999999" }} />
            <YAxis reversed tick={{ fontSize: 11, fill: "#999999" }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="rank"
              stroke="#ed5000"
              strokeWidth={2}
              dot={false}
              name="콴다"
            />
            {showCompetitors &&
              competitors?.map((c) => (
                <Line
                  key={c.dataKey}
                  type="monotone"
                  dataKey={c.dataKey}
                  stroke={c.color}
                  strokeWidth={1.5}
                  dot={false}
                  name={c.name}
                  strokeDasharray="4 2"
                />
              ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
