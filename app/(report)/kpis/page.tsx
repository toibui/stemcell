'use client'

import { useEffect, useState } from 'react'
import { Calendar, Target as TargetIcon, TrendingUp, BarChart3, PieChart } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface MonthlyKpi {
  year: number
  month: number
  monthlyTarget: number
  actualRevenue: number
  difference: number
}

interface YearlyKpi {
  year: number
  yearlyTarget: number
  actualRevenue: number
  difference: number
}

interface KpiResponse {
  monthly: MonthlyKpi[]
  yearly: YearlyKpi[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

export default function RevenueComparisonPage() {
  const today = new Date()
  const currentYear = today.getFullYear()

  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState<KpiResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async (y: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/kpis?year=${y}`)
      if (!res.ok) throw new Error('Không tải được dữ liệu KPI')
      const result: KpiResponse = await res.json()
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(year) }, [year])

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">Đang đồng bộ dữ liệu KPI...</div>
  if (!data) return null

  const yearly = data.yearly[0] || { yearlyTarget: 0, actualRevenue: 0, difference: 0 }
  const completionRate = yearly.yearlyTarget > 0 ? Math.round((yearly.actualRevenue / yearly.yearlyTarget) * 100) : 0
  const compactCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Báo cáo KPI Doanh thu</h1>
            <p className="text-slate-500 font-medium">Theo dõi chỉ tiêu tài chính bao gồm hợp đồng (đã tính chi phí ngoại viện), gia hạn và đối soát dự án</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <Calendar size={18} className="text-indigo-500" />
            <select 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              className="font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              {[0, 1, 2].map(i => (
                <option key={currentYear - i} value={currentYear - i}>Năm {currentYear - i}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION: TỔNG QUAN NĂM */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tổng quan năm {year}</h2>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Mục tiêu năm */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Mục tiêu năm</p>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <TargetIcon size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-4">{formatCurrency(yearly.yearlyTarget)}</p>
          </div>

          {/* Thực tế đạt được */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Thực tế đạt được</p>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <BarChart3 size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-4">{formatCurrency(yearly.actualRevenue)}</p>
          </div>

          {/* Chênh lệch */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Chênh lệch</p>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <PieChart size={20} />
              </div>
            </div>
            <p className={`text-2xl font-black mt-4 ${yearly.actualRevenue - yearly.yearlyTarget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(yearly.actualRevenue - yearly.yearlyTarget)}
            </p>
          </div>

          {/* Tỉ lệ hoàn thành */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Tỉ lệ hoàn thành</p>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-baseline mt-4">
                <p className="text-2xl font-black text-slate-900">{completionRate}%</p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-1000"
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: BIỂU ĐỒ BAR CHART */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Mục tiêu và doanh thu theo tháng</h2>
            <p className="mt-1 text-sm text-slate-500">So sánh thực thu (Bệnh nhân + Dự án) với kế hoạch năm {year}</p>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data.monthly} margin={{ top: 8, right: 12, left: 8, bottom: 4 }} barGap={8}>
              <CartesianGrid stroke="#e8eff2" strokeDasharray="4 6" vertical={false} />
              <XAxis
                dataKey="month"
                tickFormatter={month => `T${month}`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#647987', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8798a2', fontSize: 11 }}
                tickFormatter={compactCurrency}
                width={56}
              />
              <Tooltip
                cursor={{ fill: '#f1f7f7' }}
                contentStyle={{
                  border: '1px solid #dce8eb',
                  borderRadius: 14,
                  boxShadow: '0 8px 24px rgba(20, 43, 59, 0.10)',
                  fontSize: 13
                }}
                labelFormatter={month => `Tháng ${month}`}
                formatter={value => [formatCurrency(Number(value))]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: '#647987', paddingBottom: 16 }}
              />
              <Bar dataKey="monthlyTarget" name="Mục tiêu" fill="#b7d9d5" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="actualRevenue" name="Thực thu gộp" fill="#0f766e" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* SECTION: CHI TIẾT THEO THÁNG (TABLE) */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Chi tiết doanh thu từng tháng</h2>
        </div>

        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-xs font-black tracking-wider border-b border-slate-100">
                  <th className="px-8 py-4">Tháng</th>
                  <th className="px-8 py-4 text-right">Mục tiêu</th>
                  <th className="px-8 py-4 text-right">Thực thu</th>
                  <th className="px-8 py-4 text-center w-64">Tiến độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.monthly.map((m) => {
                  const rate = m.monthlyTarget > 0 ? Math.round((m.actualRevenue / m.monthlyTarget) * 100) : 0;
                  return (
                    <tr key={m.month} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="font-black text-slate-700">Tháng {m.month}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-medium text-slate-500">
                        {formatCurrency(m.monthlyTarget)}
                      </td>
                      <td className="px-8 py-5 text-right font-black text-emerald-600">
                        {formatCurrency(m.actualRevenue)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${rate >= 100 ? 'bg-emerald-500' : rate >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-black min-w-[35px] ${rate >= 100 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  )
}