"use client"

import { useEffect, useState } from "react"
import { Users, UserCheck, ClipboardList, FileText, Baby, Calendar } from "lucide-react"

import KPICard from "@/components/dashboard/KPICard"
import MetricCard from "@/components/dashboard/MetricCard"
import FunnelChart from "@/components/dashboard/FunnelChart"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

interface DashboardData {
  totalCustomers: number
  totalUniqueConsultedCustomers: number
  totalConsultings: number
  totalContracts: number
  totalSamples: number
  consultRate: number
  conversionRate: number
  sampleRate: number
}

export default function DashboardPage() {
  const today = new Date()
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

  const [from, setFrom] = useState(formatDate(firstDayOfYear))
  const [to, setTo] = useState(formatDate(today))
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/dashboard?from=${from}&to=${to}`)

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const result = await res.json()
      setData(result.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [from, to])

  const setPreset = (type: "month" | "30days" | "year") => {
    const now = new Date()

    if (type === "month") {
      setFrom(formatDate(new Date(now.getFullYear(), now.getMonth(), 1)))
      setTo(formatDate(now))
    }

    if (type === "30days") {
      const past = new Date()
      past.setDate(now.getDate() - 30)
      setFrom(formatDate(past))
      setTo(formatDate(now))
    }

    if (type === "year") {
      setFrom(formatDate(new Date(now.getFullYear(), 0, 1)))
      setTo(formatDate(now))
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400 animate-pulse">
        Đang tải dữ liệu...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        {error}
      </div>
    )
  }

  if (!data) return null

  const funnelData = [
    { name: "Khách hàng", value: data.totalCustomers, color: "#6366f1" },
    { name: "KH tư vấn", value: data.totalUniqueConsultedCustomers, color: "#8b5cf6" },
    { name: "Hợp đồng", value: data.totalContracts, color: "#ec4899" },
    { name: "Mẫu lấy", value: data.totalSamples, color: "#f43f5e" }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Sales Dashboard
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Phân tích dữ liệu kinh doanh đa kênh
              </p>
            </div>

            <div className="flex gap-4 items-center flex-wrap">

              {/* Preset Buttons */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPreset("month")}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition"
                >
                  Tháng này
                </button>

                <button
                  onClick={() => setPreset("30days")}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition"
                >
                  30 ngày
                </button>

                <button
                  onClick={() => setPreset("year")}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition"
                >
                  Năm nay
                </button>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <Calendar size={16} className="text-slate-400" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="text-sm font-semibold bg-transparent focus:outline-none"
                />
                <span className="text-slate-300">→</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="text-sm font-semibold bg-transparent focus:outline-none"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ================= KPI CARDS ================= */}
        <section>
          <div className="flex gap-6 overflow-x-auto pb-2">

            <KPICard title="Khách hàng" value={data.totalCustomers} icon={<Users size={14} />} color="bg-blue-50 text-blue-600" />
            <KPICard title="KH được tư vấn" value={data.totalUniqueConsultedCustomers} icon={<UserCheck size={14} />} color="bg-indigo-50 text-indigo-600" />
            <KPICard title="Tổng tư vấn" value={data.totalConsultings} icon={<ClipboardList size={14} />} color="bg-purple-50 text-purple-600" />
            <KPICard title="Hợp đồng" value={data.totalContracts} icon={<FileText size={14} />} color="bg-pink-50 text-pink-600" />
            <KPICard title="Mẫu lấy" value={data.totalSamples} icon={<Baby size={14} />} color="bg-rose-50 text-rose-600" />

          </div>
        </section>

        {/* ================= METRIC CARDS ================= */}
        <section>
          <div className="flex gap-6 flex-wrap">

            <MetricCard
              label="Tỷ lệ tư vấn"
              value={`${data.consultRate}%`}
              sub="Khách mới / Tổng"
              gradient="from-indigo-500 to-blue-500"
            />

            <MetricCard
              label="Tỷ lệ chốt"
              value={`${data.conversionRate}%`}
              sub="Hợp đồng / Tư vấn"
              gradient="from-fuchsia-500 to-purple-600"
            />

            <MetricCard
              label="Tỷ lệ mẫu"
              value={`${data.sampleRate}%`}
              sub="Mẫu / Hợp đồng"
              gradient="from-rose-500 to-orange-500"
            />

          </div>
        </section>

        {/* ================= FUNNEL CHART ================= */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-800 mb-6">
            Biểu đồ phễu chuyển đổi
          </h2>

          <FunnelChart data={funnelData} />
        </section>

      </div>
    </div>
  )
}