"use client"
import { ReactNode } from "react"
import { motion } from "framer-motion"

const colorVariants = {
  indigo: { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  amber: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  rose: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
}

interface MetricCardProps {
  label: string
  value: string | number
  sub: string
  variant?: keyof typeof colorVariants
  icon?: ReactNode
  trend?: string 
}

export default function MetricCard({ label, value, sub, variant = "indigo", icon, trend }: MetricCardProps) {
  const theme = colorVariants[variant];

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      // items-center: Căn giữa tất cả các phần tử con theo trục ngang
      className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col items-center w-full min-h-[180px] text-center"
    >
      {/* DÒNG 1: ICON (Đưa lên trên cùng và căn giữa) */}
      <div className={`p-3 rounded-2xl border mb-3 ${theme.bg} ${theme.text} ${theme.border}`}>
        {icon}
      </div>

      {/* DÒNG 2: LABEL */}
      <span className="text-slate-500 font-semibold text-[13px] tracking-wide mb-1">
        {label}
      </span>

      {/* DÒNG 3: VALUE */}
      <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        {value}
      </h3>

      {/* DÒNG 4: TREND & SUB */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        {trend && (
          <div className={`px-3 py-0.5 rounded-full text-[11px] font-bold border ${
            trend.startsWith('-') 
              ? "bg-rose-50 text-rose-600 border-rose-100" 
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          }`}>
            {trend}
          </div>
        )}
        <span className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-[150px]">
          {sub}
        </span>
      </div>
    </motion.div>
  )
}