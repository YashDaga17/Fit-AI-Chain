"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
      <h1>Analytics Dashboard 📊</h1>
      <div 
      aria-label="Analytics chart"
      style={{ width: "100%", maxWidth: "600px", margin: "auto" }}>
      <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="weight" stroke="#8884d8" />
      </LineChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
}