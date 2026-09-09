import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const assets = await prisma.asset.findMany({
      where: roomId ? { roomId } : {},
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tải tài sản' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, code, status, roomId } = await req.json();
    const asset = await prisma.asset.create({ data: { name, code, status, roomId } });
    return NextResponse.json({ success: true, asset });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi tạo tài sản' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu Asset ID' }, { status: 400 });
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Xóa tài sản thất bại' }, { status: 500 });
  }
}
