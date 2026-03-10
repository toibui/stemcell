"use client"

import { useEffect, useState } from "react"
import {
  MessageSquare,
  FileText,
  FlaskConical,
  Users,
  UserCheck,
  ClipboardList,
  Baby,
  Calendar
} from "lucide-react"

import KPICard from "@/components/dashboard/KPICard"
import MetricCard from "@/components/dashboard/MetricCard"
import FunnelChart from "@/components/dashboard/FunnelChart"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value)
}

interface DashboardData {
  totalCustomers: number
  totalUniqueConsultedCustomers: number
  totalConsultings: number
  totalContracts: number
  totalSamples: number
  revenue: number
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

        {/* HEADER */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Sales Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">
              Dữ liệu trung tâm tế bào gốc Phenikaa
            </p>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setPreset("month")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition">
                Tháng này
              </button>
              <button onClick={() => setPreset("30days")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition">
                30 ngày
              </button>
              <button onClick={() => setPreset("year")} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition">
                Năm nay
              </button>
            </div>

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
        </section>

        {/* REVENUE SECTION */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 ml-2">
          Theo dõi doanh thu
        </h2>
        <section className="flex flex-nowrap gap-6">

          <div className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl p-6 shadow-lg">
            <p className="text-sm opacity-80 font-medium">Tổng doanh thu</p>

            <h2 className="text-3xl font-black mt-2">
              {formatCurrency(data.revenue)}
            </h2>

            <p className="text-xs opacity-80 mt-1">
              Tổng tiền thu được
            </p>
          </div>

          <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">
              Giá trị hợp đồng trung bình
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              {data.totalContracts > 0
                ? formatCurrency(data.revenue / data.totalContracts)
                : "0 ₫"}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Trung bình các hợp đồng
            </p>
          </div>

          <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">
              Doanh thu / Khách tư vấn
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              {data.totalUniqueConsultedCustomers > 0
                ? formatCurrency(data.revenue / data.totalUniqueConsultedCustomers)
                : "0 ₫"}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Doanh thu trên khách hàng (đã tư vấn)
            </p>
          </div>

        </section>

        {/* KPI CARDS */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 ml-2">
          Chỉ số hiệu suất
        </h2>

        <section className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-nowrap gap-4 min-w-full">
            <KPICard title="Khách hàng" value={data.totalCustomers} icon={<Users size={20} />} color="green" />
            <KPICard title="Khách hàng (tư vấn)" value={data.totalUniqueConsultedCustomers} icon={<UserCheck size={20} />} color="purple" />
            <KPICard title="Tổng tư vấn" value={data.totalConsultings} icon={<ClipboardList size={20} />} color="blue" />
            <KPICard title="Hợp đồng" value={data.totalContracts} icon={<FileText size={20} />} color="orange" />
            <KPICard title="Mẫu lấy" value={data.totalSamples} icon={<Baby size={20} />} color="red" />
          </div>
        </section>

        {/* METRIC CARDS */}
        <h2 className="text-lg font-bold text-slate-800 mb-4 ml-2">
          Thống kê tỷ lệ
        </h2>

        <section className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-nowrap gap-4 min-w-max">

            <MetricCard
              label="Process"
              value={`${data.consultRate}%`}
              sub="Tư vấn khách / Khách mới"
              variant="indigo"
              icon={<MessageSquare size={16} />}
            />

            <MetricCard
              label="Consulting rate"
              value={`${data.conversionRate}`}
              sub="Hợp đồng / Khách tư vấn"
              variant="amber"
              icon={<FileText size={16} />}
            />

            <MetricCard
              label="Sample rate"
              value={`${data.sampleRate}%`}
              sub="Mẫu / Hợp đồng"
              variant="rose"
              icon={<FlaskConical size={16} />}
            />

          </div>
        </section>

        {/* FUNNEL CHART */}
        <section className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-800 mb-6">
            Biểu đồ các chỉ số
          </h2>

          <FunnelChart data={funnelData} />
        </section>

      </div>
    </div>
  )
}