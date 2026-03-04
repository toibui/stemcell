"use client"
import { ReactNode } from "react"
import { motion } from "framer-motion"

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", lightBg: "bg-blue-100/40", glow: "group-hover:shadow-blue-100" },
  green: { bg: "bg-green-50", text: "text-green-600", lightBg: "bg-green-100/40", glow: "group-hover:shadow-green-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", lightBg: "bg-orange-100/40", glow: "group-hover:shadow-orange-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", lightBg: "bg-purple-100/40", glow: "group-hover:shadow-purple-100" },
  red: { bg: "bg-red-50", text: "text-red-600", lightBg: "bg-red-100/40", glow: "group-hover:shadow-red-100" },
}

type ColorKey = keyof typeof colorMap;

interface KPICardProps {
  title: string
  value: number | string
  icon: ReactNode
  color?: ColorKey
  suffix?: string
}

export default function KPICard({ 
  title, 
  value, 
  icon, 
  color = "blue", 
  suffix = "" 
}: KPICardProps) {
  
  const theme = colorMap[color] || colorMap.blue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      // CHỈNH SỬA: Thêm flex-1 để chia đều rộng, min-w để tránh bị bóp quá nhỏ, và p-8 để cân đối hơn
      className={`group relative flex-1 min-w-[220px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl ${theme.glow} transition-all duration-500`}
    >
      {/* 1. Icon Section */}
      <div className={`mb-4 p-4 rounded-[1.5rem] ${theme.lightBg} ${theme.text} transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg`}>
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="flex flex-col items-center text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-tight">
          {title}
        </p>

        <div className="flex items-baseline justify-center gap-0.5">
          {/* CHỈNH SỬA: Giảm size chữ xuống text-3xl để phù hợp khi dàn hàng 5 */}
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter transition-transform duration-500 group-hover:scale-105">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          {suffix && (
            <span className="text-sm font-bold text-slate-300">
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* 3. Decor Line */}
      <div className={`mt-6 w-8 h-[2px] rounded-full ${theme.text} opacity-10 group-hover:w-16 group-hover:opacity-100 transition-all duration-700`} />
    </motion.div>
  )
}