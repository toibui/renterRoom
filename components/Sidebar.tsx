"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  Users, Baby, FileText, MessageCircle, BarChart3, Grid ,
  Settings, LogOut, User, Menu, X, HardDrive,
  Target,
  TrendingUp,
  Home,
  Receipt,
  Sigma
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSidebar } from "@/context/SidebarContext"

const roleLabel: Record<string, string> = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
}

export default function Sidebar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()
  const [openUserMenu, setOpenUserMenu] = useState(false)

  if (status === "loading" || !session) return null

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white border-r shadow-sm transition-all duration-300 z-[100] flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* LOGO SECTION */}
      <div className="p-6 flex items-center justify-between min-h-[80px]">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1"
          >
            <Link href="/" className="text-xl font-black bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent truncate font-sans tracking-tighter">
              StemCell
            </Link>
          </motion.div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* MENU ITEMS */}
      <div className="flex-1 px-3 space-y-4 overflow-y-auto scrollbar-hide py-4">
        <NavGroup label="Quản lý phòng" collapsed={collapsed}>
          <NavItem href="/rooms" icon={<Home size={20} />} label="Phòng" pathname={pathname} collapsed={collapsed} />
          <NavItem href="/meter-readings" icon={<Sigma size={20} />} label="Chỉ số điện nước" pathname={pathname} collapsed={collapsed} />
         
        </NavGroup>

        <NavGroup label="Hóa đơn thanh toán" collapsed={collapsed}>
          <NavItem href="/bills" icon={<Receipt size={20} />} label="Hóa đơn" pathname={pathname} collapsed={collapsed} />
        </NavGroup>

        <NavGroup label="Cấu hình hệ thống" collapsed={collapsed}>
          {session.user.role === "admin" && (
            <NavItem href="/staffs" icon={<User size={20} />} label="Nhân sự" pathname={pathname} collapsed={collapsed} />
            
          )}
          
          <NavItem href="/price-configs" icon={<BarChart3 size={20} />} label="Cấu hình giá" pathname={pathname} collapsed={collapsed} />
        </NavGroup>
      </div>

      {/* USER SECTION */}
      <div className="p-4 border-t relative bg-slate-50/50">
        <button
          onClick={() => setOpenUserMenu(!openUserMenu)}
          className={`w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="h-9 w-9 min-w-[36px] rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-blue-100 shadow-lg">
            {session.user?.name?.charAt(0)}
          </div>
          {!collapsed && (
            <div className="text-left flex-1 truncate">
              <p className="text-sm font-bold text-slate-700 truncate">{session.user?.name}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{roleLabel[session.user.role]}</p>
            </div>
          )}
        </button>

        <AnimatePresence>
          {openUserMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute bottom-full left-4 right-4 mb-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl p-2 z-[110]`}
            >
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-slate-50 text-slate-600 transition-colors" onClick={() => setOpenUserMenu(false)}>
                <User size={16} className="text-slate-400" /> Hồ sơ cá nhân
              </Link>
              <div className="h-px bg-slate-50 my-1 mx-2" />
              <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-red-50 text-red-600 transition-colors">
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
    <div className="mb-6">
      {!collapsed && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="px-4 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]"
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
    <Link href={href} className={`group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative ${
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
        : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
    }`}>
      <div className={`${active ? "text-white" : "text-slate-400 group-hover:text-blue-600"} transition-colors`}>
        {icon}
      </div>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-bold tracking-tight"
        >
          {label}
        </motion.span>
      )}
      {active && collapsed && (
        <div className="absolute right-0 w-1 h-6 bg-white rounded-l-full" />
      )}
    </Link>
  )
}