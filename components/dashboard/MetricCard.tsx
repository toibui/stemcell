type MetricCardProps = {
  label: string
  value: string
  sub: string
  gradient: string
}

export default function MetricCard({
  label,
  value,
  sub,
  gradient
}: MetricCardProps) {
  return (
    <div className="relative rounded-2xl p-6 bg-white border shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />

      <div className="relative">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-3xl font-black mt-2">{value}</div>
        <div className="text-xs text-slate-400 mt-1">{sub}</div>
      </div>
    </div>
  )
}