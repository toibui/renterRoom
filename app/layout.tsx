import "../styles/globals.css"
import Providers from "@/components/Providers"
import { SidebarProvider } from "@/context/SidebarContext"
import LayoutContent from "@/components/LayoutContent" // Sửa lại đường dẫn chuẩn

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <Providers>
          <SidebarProvider>
            {/* LayoutContent sẽ chứa <Sidebar /> và <main>{children}</main> */}
            <LayoutContent>
              {children}
            </LayoutContent>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  )
}