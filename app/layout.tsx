import "../styles/globals.css"
import Providers from "@/components/Providers"
import { SidebarProvider } from "@/context/SidebarContext"
import LayoutContent from "../components/LayoutContent" // Chúng ta sẽ tạo file này

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <Providers>
          <SidebarProvider>
            {/* LayoutContent là một Client Component, 
               nó sẽ bọc Sidebar và Main để xử lý logic collapsed 
            */}
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}