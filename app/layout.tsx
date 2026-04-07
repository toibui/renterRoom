import "./globals.css";
import Providers from "@/components/Providers"
import { SidebarProvider } from "@/context/SidebarContext"
import LayoutContent from "@/components/LayoutContent" // Sửa lại đường dẫn chuẩn

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="scroll-smooth"> {/* Thêm scroll-smooth để cuộn mượt */}
      <body className="bg-slate-50 font-sans text-slate-900 antialiased min-h-screen overflow-x-hidden">
        <Providers>
          <SidebarProvider>
            {/* LayoutContent là "vùng đệm". 
               Bên trong nó phải có padding-bottom khoảng 80px-100px cho mobile 
            */}
            <LayoutContent>
              {children}
            </LayoutContent>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}