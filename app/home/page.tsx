export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-800">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-400/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">
            Hệ Thống Quản Lý<br />Trung Tâm Tế Bào Gốc
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-10">
            Giải pháp số hóa toàn diện cho quản lý mẫu tế bào gốc,
            hồ sơ bệnh nhân và hệ thống lưu trữ đạt chuẩn y khoa.
          </p>

          <div className="flex justify-center gap-6">
            <a
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300"
            >
              Đăng nhập hệ thống
            </a>

            <a
              href="#features"
              className="px-8 py-4 bg-white border border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300"
            >
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          Tính năng nổi bật
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <Feature
            icon="🧬"
            title="Quản lý mẫu"
            desc="Theo dõi mã mẫu, vị trí bảo quản và trạng thái xử lý theo thời gian thực."
          />
          <Feature
            icon="👩‍⚕️"
            title="Hồ sơ bệnh nhân"
            desc="Lưu trữ thông tin, lịch sử thu thập và quá trình điều trị."
          />
          <Feature
            icon="❄️"
            title="Kho lạnh"
            desc="Quản lý vị trí tủ đông, nhiệt độ và kiểm kê định kỳ."
          />
          <Feature
            icon="📊"
            title="Báo cáo & thống kê"
            desc="Phân tích dữ liệu và xuất báo cáo chuyên sâu nhanh chóng."
          />
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">
            Bảo mật & Tuân thủ tiêu chuẩn y tế
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Hệ thống áp dụng phân quyền theo vai trò, mã hóa dữ liệu,
            lưu vết hoạt động (Audit Log) và đảm bảo an toàn thông tin
            theo quy trình nội bộ trung tâm.
          </p>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <Stat number="10.000+" label="Mẫu đang lưu trữ" />
          <Stat number="99.9%" label="Độ ổn định hệ thống" />
          <Stat number="24/7" label="Giám sát kho lạnh" />
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-900 text-slate-300 py-10 text-center">
        <p className="font-medium">
          Trung Tâm Tế Bào Gốc XYZ
        </p>
        <p className="text-sm mt-2 opacity-70">
          © 2026 — Phiên bản 1.0
        </p>
      </footer>
    </main>
  )
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string
  title: string
  desc: string
}) {
  return (
    <div className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-3 group-hover:text-blue-600 transition">
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="p-10 bg-white rounded-2xl shadow-md">
      <div className="text-4xl font-bold text-blue-600 mb-3">
        {number}
      </div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}