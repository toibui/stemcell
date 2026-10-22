"use client"

import Link from "next/link"
import { 
  Dna, 
  ShieldCheck, 
  Activity, 
  ThermometerSnowflake, 
  Users, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  FileText 
} from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      {/* ===== NAVIGATION BAR ===== */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Activity size={22} className="animate-pulse" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              BioCell Pro
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-teal-400 transition-colors">Tính năng</a>
            <a href="#security" className="hover:text-teal-400 transition-colors">Tiêu chuẩn Y tế</a>
            <a href="#stats" className="hover:text-teal-400 transition-colors">Thông số</a>
          </nav>
    </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto text-center">
        {/* Live Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Hệ thống Giám sát Kho lạnh & Mẫu Tế bào Gốc 24/7 Active
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-8">
          Hệ Thống Quản Lý <br />
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
            Trung Tâm Tế Bào Gốc
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
          Giải pháp số hóa chuyên sâu dành cho ngân hàng lưu trữ tế bào gốc, quản lý mã mẫu sinh học, 
          quy trình theo dõi ca sinh và hồ sơ khách hàng đạt chuẩn Y khoa Quốc tế.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-2xl shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 group transition-all duration-300"
          >
            Truy cập Hệ thống
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-800 transition-all duration-300"
          >
            Khám phá tính năng
          </a>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Tính Năng Nổi Bật Dành Cho Trung Tâm Lab
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Tối ưu hóa quy trình lưu trữ, quản lý vận hành từ khâu thu thập mẫu đến phân tích sinh học.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Dna className="text-teal-400" size={28} />}
            title="Quản lý mẫu sinh học"
            desc="Theo dõi mã barcoding, vị trí lưu trữ nitơ lỏng và tình trạng mẫu theo thời gian thực."
          />
          <FeatureCard
            icon={<Users className="text-cyan-400" size={28} />}
            title="Hồ sơ khách hàng"
            desc="Lưu trữ tiền sử y khoa, thông tin gia đình và lịch sử thu thập mẫu an toàn, bảo mật."
          />
          <FeatureCard
            icon={<ThermometerSnowflake className="text-sky-400" size={28} />}
            title="Giám sát kho lạnh"
            desc="Tự động theo dõi nhiệt độ tủ đông, cảnh báo biến động môi trường bảo quản 24/7."
          />
          <FeatureCard
            icon={<BarChart3 className="text-emerald-400" size={28} />}
            title="Báo cáo & Analytics"
            desc="Phân tích chỉ số KPIs, tốc độ tăng trưởng mẫu lưu trữ và xuất báo cáo y khoa."
          />
        </div>
      </section>

      {/* ===== SECURITY & COMPLIANCE SECTION ===== */}
      <section id="security" className="py-20 px-6 bg-gradient-to-b from-slate-900/60 to-slate-950 border-y border-slate-800/60">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={16} /> Tuân thủ tiêu chuẩn y tế
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              An toàn dữ liệu & Kiểm soát vận hành nghiêm ngặt
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Hệ thống được thiết kế đáp ứng các tiêu chuẩn bảo mật dữ liệu y tế khắt khe, giúp trung tâm hoạt động an toàn và minh bạch tuyệt đối.
            </p>

            <ul className="space-y-4">
              <ComplianceItem text="Phân quyền truy cập 3 lớp (Admin, Staff, Lab Technician)" />
              <ComplianceItem text="Mã hóa dữ liệu khách hàng theo chuỗi tiêu chuẩn bảo mật" />
              <ComplianceItem text="Lưu vết lịch sử thao tác hệ thống (Audit Log) chi tiết" />
              <ComplianceItem text="Tự động sao lưu dữ liệu kho lạnh dự phòng đa tầng" />
            </ul>
          </div>

          <div className="relative p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <Lock className="text-teal-400" size={20} />
                  <span className="text-sm font-semibold text-slate-200">Trạng thái mã hóa</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">AES-256 Active</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <FileText className="text-cyan-400" size={20} />
                  <span className="text-sm font-semibold text-slate-200">Nhật ký Audit Log</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">1,024 events/day</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <ThermometerSnowflake className="text-sky-400" size={20} />
                  <span className="text-sm font-semibold text-slate-200">Nhiệt độ Bồn Cryo #01</span>
                </div>
                <span className="text-xs font-bold text-teal-400 font-mono">-196°C Normal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section id="stats" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <StatCard number="10,000+" label="Mẫu tế bào đang bảo quản" />
          <StatCard number="99.99%" label="Thời gian hoạt động hệ thống" />
          <StatCard number="-196°C" label="Nhiệt độ duy trì chuẩn Cryo" />
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-teal-400" />
            <span className="font-bold text-slate-300">BioCell Pro — StemCell Management</span>
          </div>
          <p>© 2026 Trung Tâm Tế Bào Gốc BioCell. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-teal-500/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
      <div className="p-3 rounded-2xl bg-slate-950 w-fit mb-6 border border-slate-800 group-hover:border-teal-500/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-teal-300 transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

function ComplianceItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
      <span className="text-slate-300 text-sm">{text}</span>
    </li>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
      <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent mb-2">
        {number}
      </div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
    </div>
  )
}