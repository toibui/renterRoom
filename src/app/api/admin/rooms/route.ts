import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { roomNumber: 'asc' },
      include: { tenants: true, assets: true }
    });
    return NextResponse.json({ rooms });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy danh sách phòng' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { roomNumber, rentPrice } = await req.json();
    if (!roomNumber || !rentPrice) {
      return NextResponse.json({ error: 'Thiếu số phòng hoặc giá thuê' }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        roomNumber,
        rentPrice: parseFloat(rentPrice),
      },
    });

    return NextResponse.json({ success: true, room });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể tạo phòng. Số phòng có thể đã tồn tại' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID phòng' }, { status: 400 });

    await prisma.room.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Không thể xóa phòng' }, { status: 500 });
  }
}
