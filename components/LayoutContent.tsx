"use client"

import Sidebar from "./Sidebar"
import { useSidebar } from "@/context/SidebarContext"

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar nằm cố định bên trái */}
      <Sidebar />
      
      {/* CHÌA KHÓA Ở ĐÂY: 
          Nếu Sidebar mở (collapsed=false) -> pl-64
          Nếu Sidebar thu gọn (collapsed=true) -> pl-20
      */}
        <main 
        style={{ paddingLeft: collapsed ? '80px' : '256px' }}
        className="flex-1 transition-all duration-300 ease-in-out bg-slate-50 min-h-screen"
        >
        <div className="p-8 max-w-[1600px] mx-auto">
            {children}
        </div>
        </main>
    </div>
  )
}