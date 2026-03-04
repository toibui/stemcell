type KPICardProps = {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

export default function KPICard({ title, value, icon, color }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>

      <div className="text-2xl font-black">
        {value?.toLocaleString()}
      </div>

      <div className="text-sm text-slate-500 mt-1">
        {title}
      </div>
    </div>
  )
}