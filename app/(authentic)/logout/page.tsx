"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      await signOut({ redirect: false })
      router.push("/login") // chuyển về trang login sau khi logout
    }

    logout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Đang đăng xuất...</p>
    </div>
  )
}
