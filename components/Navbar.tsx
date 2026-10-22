"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  Users, Baby, FileText, Stethoscope, BarChart3, LayoutDashboard,
  LogOut, User, Menu, X, Database,
  Target, TrendingUp, ShieldCheck, Dna
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSidebar } from "@/context/SidebarContext"

const roleLabel: Record<string, string> = {
  admin: "Quản trị viên",
  staff: "Nhân viên y tế",
  lab: "Kỹ thuật viên Lab",
}

export default function Sidebar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const [openUserMenu, setOpenUserMenu] = useState(false)

  if (status === "loading" || !session) return null

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-[#102b3a]/95 backdrop-blur-xl border-r border-[#234454] shadow-xl shadow-slate-950/10 transition-all duration-300 z-[100] flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* LOGO SECTION */}
      <div className="p-5 flex items-center justify-between min-h-[84px] border-b border-white/10">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 flex-1 overflow-hidden"
          >
            <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-950/30">
              <Dna size={21} strokeWidth={1.8} />
            </div>
            <div className="flex flex-col truncate">
              <Link href="/" className="text-lg font-extrabold bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent truncate font-sans tracking-tight">
                BioCell Pro
              </Link>
              <span className="text-[9px] font-bold text-teal-300 tracking-[0.18em] uppercase">
                StemCell Lab
              </span>
            </div>
          </motion.div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all border border-white/15 ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* MENU ITEMS */}
      <div className="flex-1 px-3.5 space-y-6 overflow-y-auto scrollbar-hide py-6">
        <NavGroup label="Chăm sóc khách hàng" collapsed={collapsed}>
          <NavItem href="/customers" icon={<Users size={20} />} label="Hồ sơ khách hàng" pathname={pathname} collapsed={collapsed} />
          <NavItem href="/consultings" icon={<Stethoscope size={20} strokeWidth={1.8} />} label="Tư vấn y tế" pathname={pathname} collapsed={collapsed} />
        </NavGroup>

        <NavGroup label="Y tế & Lưu trữ" collapsed={collapsed}>
          <NavItem href="/birthtracking" icon={<Baby size={20} />} label="Theo dõi sinh & Mẫu" pathname={pathname} collapsed={collapsed} />
          <NavItem href="/contracts" icon={<FileText size={20} />} label="Hợp đồng lưu trữ" pathname={pathname} collapsed={collapsed} />
          <NavItem href="/types" icon={<Database size={20} strokeWidth={1.8} />} label="Gói lưu trữ Bio" pathname={pathname} collapsed={collapsed} />
        </NavGroup>

        <NavGroup label="Phân tích & Hiệu suất" collapsed={collapsed}>
          <NavItem href="/dashboards" icon={<LayoutDashboard size={20} strokeWidth={1.8} />} label="Tổng quan Dashboard" pathname={pathname} collapsed={collapsed} />
          <NavItem href="/kpis" icon={<TrendingUp size={20} />} label="Chỉ số KPIs" pathname={pathname} collapsed={collapsed} />
          <NavItem href="/targets" icon={<Target size={20} />} label="Mục tiêu chiến lược" pathname={pathname} collapsed={collapsed} />
        </NavGroup>

        <NavGroup label="Hệ thống & Vận hành" collapsed={collapsed}>
          {session.user.role === "admin" && (
            <NavItem href="/staffs" icon={<User size={20} />} label="Quản lý nhân sự" pathname={pathname} collapsed={collapsed} />
          )}
          <NavItem href="/channel-marketing" icon={<BarChart3 size={20} />} label="Marketing Y tế" pathname={pathname} collapsed={collapsed} />
        </NavGroup>
      </div>

      {/* USER SECTION */}
      <div className="p-4 border-t border-white/10 relative bg-slate-950/20">
        <button
          onClick={() => setOpenUserMenu(!openUserMenu)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/15 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="relative">
            <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-950/40 border border-teal-300/30">
              {session.user?.name?.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#102b3a]" />
          </div>
          {!collapsed && (
            <div className="text-left flex-1 truncate">
              <p className="text-sm font-bold text-white truncate">{session.user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck size={12} className="text-teal-300" />
                <span className="text-[10px] text-teal-200 font-extrabold uppercase tracking-wider">
                  {roleLabel[session.user.role]}
                </span>
              </div>
            </div>
          )}
        </button>

        <AnimatePresence>
          {openUserMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-4 right-4 mb-4 bg-[#102b3a] border border-white/20 rounded-2xl shadow-2xl p-2 z-[110] backdrop-blur-2xl"
            >
              <Link 
                href="/profile" 
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-white/10 text-white transition-colors" 
                onClick={() => setOpenUserMenu(false)}
              >
                <User size={16} className="text-teal-300" /> Hồ sơ cá nhân
              </Link>
              <div className="h-px bg-white/10 my-1 mx-2" />
              <button 
                onClick={() => signOut({ callbackUrl: "/auth/login" })} 
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-rose-500/15 text-rose-300 hover:text-rose-200 transition-colors"
              >
                <LogOut size={16} /> Thoát hệ thống
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}

function NavGroup({ label, children, collapsed }: { label: string, children: React.ReactNode, collapsed: boolean }) {
  return (
    <div className="space-y-1.5">
      {!collapsed && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="px-3 text-[10px] font-extrabold text-teal-200/90 uppercase tracking-[0.18em]"
        >
          {label}
        </motion.p>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function NavItem({ href, icon, label, pathname, collapsed }: { href: string, icon: React.ReactNode, label: string, pathname: string, collapsed: boolean }) {
  const active = pathname === href || pathname.startsWith(`${href}/`)
  
  return (
    <Link 
      href={href} 
      className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all duration-300 relative ${
        active 
          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-950/40 border border-teal-300/30" 
          : "text-slate-100 hover:bg-white/10 hover:text-white border border-transparent"
      }`}
    >
      <div className={`${active ? "text-white" : "text-teal-200 group-hover:text-white"} transition-colors shrink-0`}>
        {icon}
      </div>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-sm font-bold tracking-tight truncate ${active ? "text-white" : "text-slate-100 group-hover:text-white"}`}
        >
          {label}
        </motion.span>
      )}
      {active && collapsed && (
        <div className="absolute right-0 w-1.5 h-6 bg-teal-300 rounded-l-full shadow-lg shadow-teal-300" />
      )}
    </Link>
  )
}