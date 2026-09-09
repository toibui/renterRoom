import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({ include: { room: true } });
    const data = tenants.map((t) => ({
      'Phòng': t.room.roomNumber,
      'Họ và Tên': t.fullName,
      'Số Điện thoại': t.phone,
      'Số CCCD': t.identityCard,
      'Đã đăng ký tạm trú': t.isTemporaryReg ? 'Rồi' : 'Chưa',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NhanKhau');

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Danh_Sach_Tam_Tru.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xuất file' }, { status: 500 });
  }
}
