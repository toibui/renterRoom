import Link from 'next/link';
import { 
  Home as HomeIcon, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  PlusCircle,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Decor background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Phiên bản 2026 đã sẵn sàng
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Quản lý nhà trọ <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Thông minh & Tự động
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-500 mb-12 leading-relaxed">
            Giải pháp số hóa giúp chủ trọ chốt số điện nước, xuất hóa đơn 
            tự động và theo dõi doanh thu chỉ trong vài lượt chạm.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/meter-readings/new"
              className="group px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              Chốt số ngay
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/rooms"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Quản lý danh sách phòng
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black mb-4">Mọi thứ bạn cần để vận hành</h2>
            <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Zap className="text-amber-500" />}
              title="Điện Nước"
              desc="Nhập chỉ số nhanh, tự động tính toán tiêu thụ và thành tiền theo đơn giá."
            />
            <FeatureCard 
              icon={<HomeIcon className="text-blue-500" />}
              title="Phòng Trống"
              desc="Theo dõi trạng thái phòng, thông tin khách thuê và hợp đồng lưu trú."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-emerald-500" />}
              title="Doanh Thu"
              desc="Báo cáo tài chính trực quan theo tháng, năm và thống kê nợ phí."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-indigo-500" />}
              title="Hóa Đơn"
              desc="Tự động tạo mẫu hóa đơn chuyên nghiệp để gửi qua Zalo hoặc in ấn."
            />
          </div>
        </div>
      </section>

      {/* ===== QUICK STATS ===== */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-center">
            <StatItem value="25" label="Phòng đang quản lý" />
            <StatItem value="100%" label="Chỉ số chính xác" />
            <StatItem value="< 1p" label="Thời gian tạo hóa đơn" />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <HomeIcon size={18} className="text-white" />
            </div>
            <span className="font-black tracking-tighter text-xl">HOME MANAGER</span>
          </div>
          
          <div className="text-slate-400 text-sm font-medium">
            © 2026 Hệ thống quản lý nội bộ.
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-black text-slate-900 mb-2">{value}</div>
      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}