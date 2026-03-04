"use client"
import { createContext, useContext, useState, ReactNode } from "react"

const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: (val: boolean) => {},
})

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)