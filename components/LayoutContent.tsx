"use client"
import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import { Home, Sigma, Receipt, User, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Kiểm tra thiết bị ngay khi nạp trang
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // GIAO DIỆN MOBILE
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        {/* TOP BAR: Cố định tuyệt đối */}
        <header className="fixed top-0 inset-x-0 h-[var(--header-height)] bg-white border-b z-50 px-4 flex items-center justify-between shadow-sm">
          <span className="font-black text-blue-600 italic">Quản lý phòng trọ</span>
          <button onClick={() => setMenuOpen(true)} className="p-2 text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        {/* NỘI DUNG CHÍNH: Đẩy xuống bằng margin để không bị đè */}
        <main className="flex-1 mt-[var(--header-height)] mb-[var(--tabbar-height)] p-4 overflow-y-auto">
          {children}
        </main>

        {/* BOTTOM NAV: Cố định tuyệt đối dưới đáy */}
        <nav className="fixed bottom-0 inset-x-0 h-[var(--tabbar-height)] bg-white border-t z-50 flex items-center justify-around pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <MobileLink href="/rooms" icon={<Home />} active={pathname === "/rooms"} />
          <MobileLink href="/meter-readings" icon={<Sigma />} active={pathname === "/meter-readings"} />
          <MobileLink href="/bills" icon={<Receipt />} active={pathname === "/bills"} />
          <MobileLink href="/profile" icon={<User />} active={pathname === "/profile"} />
        </nav>

        {/* FULLSCREEN OVERLAY: Khi bấm Menu */}
        {menuOpen && (
          <div className="fixed inset-0 bg-white z-[100] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <span className="font-black text-2xl text-blue-600">MENU</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 bg-slate-100 rounded-full"><X /></button>
            </div>
            <div className="space-y-6 text-xl font-bold text-slate-800">
                <Link href="/settings" onClick={() => setMenuOpen(false)}>Cài đặt</Link>
                <div className="h-px bg-slate-100" />
                <button className="text-rose-500 w-full text-left">Đăng xuất</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // GIAO DIỆN DESKTOP (MD trở lên)
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 transition-all">
        {children}
      </main>
    </div>
  )
}

function MobileLink({ href, icon, active }: any) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 ${active ? "text-blue-600" : "text-slate-400"}`}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">
        {href.replace("/", "") || "Home"}
      </span>
    </Link>
  )
}