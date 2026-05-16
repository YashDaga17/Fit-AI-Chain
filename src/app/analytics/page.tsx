"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const data = [
  { date: "Mon", weight: 70 },
  { date: "Tue", weight: 69 },
  { date: "Wed", weight: 68 },
  { date: "Thu", weight: 67 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="weight" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}