import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts"

interface FunnelDataPoint {
  name: string
  value: number
  color: string
}

export default function FunnelChart({ data }: { data: FunnelDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid stroke="#e8eff2" strokeDasharray="4 6" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#647987", fontSize: 12, fontWeight: 600 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#8798a2", fontSize: 11 }}
          tickFormatter={value => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value)}
          width={48}
        />
        <Tooltip
          cursor={{ fill: "#f1f7f7" }}
          contentStyle={{
            border: "1px solid #dce8eb",
            borderRadius: 14,
            boxShadow: "0 8px 24px rgba(20, 43, 59, 0.10)",
            fontSize: 13
          }}
          labelStyle={{ color: "#334b59", fontWeight: 700, marginBottom: 4 }}
          itemStyle={{ color: "#0f766e", fontWeight: 700 }}
          formatter={value => [new Intl.NumberFormat("vi-VN").format(Number(value)), "Số lượng"]}
        />
        <Bar dataKey="value" name="Số lượng" radius={[8, 8, 0, 0]} maxBarSize={56}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}