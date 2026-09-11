import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'Thiếu roomId' }, { status: 400 });

    const latestInvoice = await prisma.invoice.findFirst({
      where: { roomId },
      orderBy: { updatedAt: 'desc' },
      select: { newElectric: true, newWater: true },
    });

    return NextResponse.json({
      oldElectric: latestInvoice ? latestInvoice.newElectric : 0,
      oldWater: latestInvoice ? latestInvoice.newWater : 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy chỉ số điện nước gần nhất' }, { status: 500 });
  }
}
