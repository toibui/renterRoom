"use client"
import { useEffect, useState } from "react"

export default function Sidebar() {
  const [domReady, setDomReady] = useState(false)

  useEffect(() => {
    setDomReady(true)
  }, [])

  // Ngăn chặn render trên server để window.innerWidth hoạt động chuẩn
  if (!domReady) return null

  // CHỐT CHẶN CUỐI CÙNG: Nếu là mobile, biến mất hoàn toàn khỏi DOM
  if (window.innerWidth < 768) return null

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r z-50 flex flex-col">
      {/* Code Sidebar Desktop của bạn */}
    </aside>
  )
}