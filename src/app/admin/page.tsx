import Link from 'next/link';

export default function AdminHubPage() {
  const cards = [
    { title: 'Thông Tin Nhà Trọ', desc: 'Tên chủ nhà, số điện thoại và địa chỉ làm hợp đồng', href: '/admin/property', color: 'bg-indigo-500', icon: '🏠' },
    { title: 'Quản Lý Phòng', desc: 'Tạo phòng mới, cập nhật giá thuê & mã token', href: '/admin/rooms', color: 'bg-blue-500', icon: '🔑' },
    { title: 'Chốt Điện Nước', desc: 'Nhập chỉ số điện/nước, tự động tính tổng tiền', href: '/admin/electric-water', color: 'bg-teal-500', icon: '⚡' },
    { title: 'Duyệt Hóa Đơn', desc: 'Bảng theo dõi thu tiền, xác nhận 1-chạm', href: '/admin/invoices', color: 'bg-purple-500', icon: '📄' },
    { title: 'Quản Lý Nhân Khẩu', desc: 'Khai báo tạm trú, xuất file Excel', href: '/admin/tenants', color: 'bg-emerald-500', icon: '👥' },
    { title: 'Quản Lý Tài Sản', desc: 'Kiểm kê đồ đạc, thiết bị theo từng phòng', href: '/admin/assets', color: 'bg-amber-500', icon: '📦' },
  ];

  return (
    <div className="p-4 space-y-4">
      <header className="pb-2">
        <h1 className="text-xl font-bold text-slate-900">Trung Tâm Quản Trị</h1>
        <p className="text-xs text-slate-500">Chọn nghiệp vụ để bắt đầu xử lý</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm active:scale-[0.98] transition">
            <div className={`w-12 h-12 rounded-xl ${c.color} text-white flex items-center justify-center text-xl shrink-0`}>
              {c.icon}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{c.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
