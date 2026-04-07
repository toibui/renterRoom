import React from 'react'; // Thêm dòng này
import Link from 'next/link';
import { 
  Home as HomeIcon, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  PlusCircle,
  ArrowRight,
  Target
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-40 px-6">
        {/* Tăng cường Decor background để trông huyền ảo hơn */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/10 blur-[100px] md:blur-[150px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 md:w-[500px] md:h-[500px] bg-indigo-500/10 blur-[100px] md:blur-[150px] rounded-full animate-pulse-slow delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          {/* Badge: Tinh chỉnh animation và padding */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs md:text-sm font-bold mb-8 md:mb-10 shadow-sm border border-blue-100/50 animate-fade-in-down">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            Sẵn sàng cho kỷ nguyên quản lý số 2026
          </div>

          {/* Heading: Tối ưu font-size và line-height cho mobile */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 md:mb-10 leading-[1.05] animate-fade-in-up">
            Quản lý nhà trọ <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent decoration-wavy decoration-blue-200 underline-offset-4 hover:underline">
              Thông minh & Tự động
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-600 mb-12 md:mb-16 leading-relaxed animate-fade-in-up delay-200">
            Giải pháp số hóa toàn diện giúp chủ trọ chốt số điện nước, xuất hóa đơn 
            tự động và theo dõi doanh thu chỉ trong vài lượt chạm nhẹ nhàng.
          </p>

          {/* Buttons: Nâng cấp style và tương tác */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up delay-400">
            <Link
              href="/meter-readings/new"
              className="group px-10 py-5 bg-slate-950 text-white rounded-2xl font-extrabold shadow-2xl shadow-slate-300 hover:bg-black hover:shadow-slate-400 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2.5 text-lg"
            >
              <PlusCircle size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              Chốt số ngay
              <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

            <Link
              href="/rooms"
              className="px-10 py-5 bg-white border border-slate-200 text-slate-800 rounded-2xl font-extrabold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center text-lg shadow-sm"
            >
              Quản lý danh sách phòng
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-20 md:py-32 bg-slate-50/50 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4">
              <Target size={14} />
              GIẢI PHÁP TOÀN DIỆN
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-5">Mọi thứ bạn cần để vận hành</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-base md:text-lg">Tích hợp đầy đủ công cụ giúp tối ưu hóa quy trình và tiết kiệm thời gian.</p>
          </div>

          {/* Grid: Tăng gap và bo góc card mạnh hơn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {[
              { icon: <Zap className="text-amber-500" />, title: "Điện Nước", desc: "Nhập chỉ số nhanh, tự động tính toán tiêu thụ và thành tiền theo đơn giá." },
              { icon: <HomeIcon className="text-blue-500" />, title: "Phòng Trống", desc: "Theo dõi trạng thái phòng, thông tin khách thuê và hợp đồng lưu trú." },
              { icon: <BarChart3 className="text-emerald-500" />, title: "Doanh Thu", desc: "Báo cáo tài chính trực quan theo tháng, năm và thống kê nợ phí." },
              { icon: <ShieldCheck className="text-indigo-500" />, title: "Hóa Đơn", desc: "Tự động tạo mẫu hóa đơn chuyên nghiệp để gửi qua Zalo hoặc in ấn." }
            ].map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 100} />
            ))}
          </div>
        </div>
        {/* Thêm một chút họa tiết nền */}
        <div className="absolute inset-0 opacity-[0.02] grid grid-cols-6 gap-2 -z-0">
          {[...Array(24)].map((_, i) => <div key={i} className="w-full h-full border border-slate-300 rounded-lg"></div>)}
        </div>
      </section>

      {/* ===== QUICK STATS ===== */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Nâng cấp Stat Items thành các Card riêng biệt */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-center">
            <StatItemCard value="25" label="Phòng đang quản lý" icon={<HomeIcon size={24} className="text-blue-600" />} />
            <StatItemCard value="100%" label="Chỉ số chính xác" icon={<ShieldCheck size={24} className="text-emerald-600" />} />
            <StatItemCard value="< 1p" label="Thời gian tạo hóa đơn" icon={<Zap size={24} className="text-amber-600" />} />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-100 py-16 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <HomeIcon size={22} className="text-white" />
              </div>
              <span className="font-black tracking-tighter text-2xl uppercase text-slate-950">Home Manager</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm">Giải pháp số hóa thông minh cho chủ trọ thời đại mới. Đơn giản, hiệu quả và tin cậy.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-3 text-slate-500 text-sm font-medium border-t border-slate-200 md:border-none pt-6 md:pt-0 w-full md:w-auto">
            <span>© 2026 Hệ thống quản lý nội bộ XYZ.</span>
            <div className="flex gap-6 text-xs text-blue-600 hover:text-blue-800">
              <a href="#" className="hover:underline">Điều khoản</a>
              <a href="#" className="hover:underline">Bảo mật</a>
              <a href="#" className="hover:underline">Hỗ trợ</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// --- HỢP PHẦN BỔ TRỢ ---

// Thêm tham số 'delay' vào định nghĩa Props
function FeatureCard({ 
  icon, 
  title, 
  desc, 
  delay // Thêm tham số này vào đây
}: { 
  icon: React.ReactNode, 
  title: string, 
  desc: string,
  delay?: number // Khai báo kiểu dữ liệu cho delay (dấu ? nghĩa là không bắt buộc)
}) {
  return (
    <div 
      className="p-6 md:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
      // Nếu bạn muốn dùng delay cho animation (tùy chọn)
      style={{ animationDelay: `${delay}ms` }} 
    >
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 28 }) 
          : icon
        }
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// Nâng cấp StatItem thành Card
function StatItemCard({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in-up">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100/50 shadow-inner">
        {icon}
      </div>
      <div className="text-5xl md:text-6xl font-black text-slate-950 mb-3 tracking-tighter">{value}</div>
      <div className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-[0.25em] leading-tight px-4">{label}</div>
    </div>
  );
}