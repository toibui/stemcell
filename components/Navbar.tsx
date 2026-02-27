"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState } from "react"

const roleLabel: Record<string, string> = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  lab: "Kỹ thuật viên",
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (status === "loading") return null

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent"
          >
            StemCell System
          </Link>

          {session && (
            <div className="flex items-center gap-6">
              <NavItem href="/customers" pathname={pathname}>
                Customers
              </NavItem>
              <NavItem href="/birthtracking" pathname={pathname}>
                Birth Tracking
              </NavItem>
              <NavItem href="/contracts" pathname={pathname}>
                Contracts
              </NavItem>
              <NavItem href="/consultings" pathname={pathname}>
                Consultings
              </NavItem>
              <NavItem href="/channel-marketing" pathname={pathname}>
                Channel-marketing
              </NavItem>

              {session.user.role === "admin" && (
                <NavItem href="/staffs" pathname={pathname}>
                  Staffs
                </NavItem>
              )}
              
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 relative">
          {session ? (
            <>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                  {session.user?.name?.charAt(0)}
                </div>

                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {roleLabel[session.user.role] || session.user.role}
                  </p>
                </div>
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 top-14 w-52 bg-white border rounded-2xl shadow-xl p-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm rounded-lg hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/auth/login"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavItem({
  href,
  pathname,
  children,
}: {
  href: string
  pathname: string
  children: React.ReactNode
}) {
  const active = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`text-sm font-medium transition ${
        active
          ? "text-blue-600 border-b-2 border-blue-600 pb-1"
          : "text-gray-600 hover:text-blue-600"
      }`}
    >
      {children}
    </Link>
  )
}