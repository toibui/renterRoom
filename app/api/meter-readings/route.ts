import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    const readings = await prisma.meterReading.findMany({
      where: roomId ? { roomId } : {},
      include: {
        room: true,
        bill: {
          select: {
            id: true,
            status: true,
            paidAt: true,
            totalAmount: true,
            emailSent: true,
          },
        },
      },

      // ✅ SORT CHUẨN: mới nhất trước
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        {
          room: {
            roomNumber: 'asc',
          },
        },
        { createdAt: 'desc' },
      ]
    });

    return NextResponse.json(readings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy dữ liệu' },
      { status: 500 }
    );
  }
}