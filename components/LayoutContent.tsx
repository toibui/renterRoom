"use client"

import Sidebar from "./Sidebar"
import { useSidebar } from "@/context/SidebarContext"
import Link from 'next/link'
import { Home, Sigma, Receipt, User, Menu, X, Settings, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      {/* SIDEBAR: Chỉ hiện trên Máy tính (md trở lên) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* VÙNG NỘI DUNG CHÍNH */}
      <main 
        className="flex-1 transition-all duration-300 min-h-screen flex flex-col"
        style={{ 
          paddingLeft: typeof window !== 'undefined' && window.innerWidth >= 768 
            ? (collapsed ? '80px' : '256px') 
            : '0px' 
        }}
      >
        {/* CONTAINER CON: 
            - pt-6: Cách mép trên 24px.
            - pb-32: Cách mép dưới 128px (Đủ để né thanh Bottom Tab 70px).
            - px-4: Cách 2 bên lề để không dính vách.
        */}
        <div className="flex-1 w-full max-w-[1200px] mx-auto p-4 md:p-8 pb-32 md:pb-10 min-h-screen">
            {children}
        </div>
      </main>

      {/* BOTTOM TAB BAR: Chỉ hiện trên Mobile (md trở xuống) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-white border-t border-slate-200 flex items-center justify-around px-2 z-50 shadow-[0_-2px_15px_rgba(0,0,0,0.08)]">
        <BottomTab href="/" icon={<Home size={24} />} label="Home" active={pathname === '/'} />
        <BottomTab href="/rooms" icon={<User size={24} />} label="Phòng" active={pathname.includes('/rooms')} />
        <BottomTab href="/meter-readings" icon={<Sigma size={24} />} label="Số" active={pathname.includes('/meter-readings')} />
        <BottomTab href="/bills" icon={<Receipt size={24} />} label="Hóa đơn" active={pathname.includes('/bills')} />
        
        {/* Nút 3 gạch Menu */}
        <button 
          onClick={() => setShowMenu(true)} 
          className="flex flex-col items-center justify-center w-full h-full text-slate-400 active-scale"
        >
          <Menu size={24} />
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Menu</span>
        </button>
      </nav>

      {/* MENU FULLSCREEN (Khi bấm 3 gạch) */}
      {showMenu && (
        <div className="fixed inset-0 bg-[#f0f2f5] z-[100] animate-in slide-in-from-bottom duration-300 overflow-y-auto">
           <div className="p-6 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black italic tracking-tighter text-slate-900">Rental</h2>
                <button onClick={() => setShowMenu(false)} className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-white p-5 rounded-[2rem] shadow-sm mb-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">R</div>
                <div>
                  <p className="font-black text-lg text-slate-900 leading-tight">Rental Manager</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Hệ Thống</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <MenuShortcut icon={<Settings size={20} />} label="Cài đặt" />
                 <MenuShortcut icon={<LogOut size={20} className="text-rose-500" />} label="Đăng xuất" />
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function BottomTab({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      href={href} 
      className={`relative flex flex-col items-center justify-center w-full h-full transition-all ${
        active ? 'text-blue-600' : 'text-slate-400'
      }`}
    >
      {active && <div className="absolute top-0 w-12 h-1 bg-blue-600 rounded-b-full shadow-[0_2px_10px_rgba(37,99,235,0.4)]" />}
      <div className={`transition-transform duration-200 ${active ? 'scale-110 mt-1' : 'mt-1'}`}>{icon}</div>
      <span className={`text-[9px] font-black mt-1 uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
    </Link>
  )
}

function MenuShortcut({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="bg-white p-5 rounded-[1.5rem] shadow-sm flex flex-col gap-4 active-scale border border-slate-100">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600">
        {icon}
      </div>
      <p className="font-black text-[11px] uppercase tracking-tight text-slate-700">{label}</p>
    </div>
  )
}