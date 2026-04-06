import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const month = parseInt(searchParams.get('month') || '0');
  const year = parseInt(searchParams.get('year') || '0');

  if (!roomId) return NextResponse.json({ error: "Thiếu roomId" }, { status: 400 });

  // Tìm bản ghi gần nhất trước thời điểm đang chọn
  const lastReading = await prisma.meterReading.findFirst({
    where: {
      roomId: roomId,
      OR: [
        { year: { lt: year } }, // Năm trước đó
        { year: year, month: { lt: month } } // Cùng năm nhưng tháng trước đó
      ]
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' }
    ]
  });

  // Nếu không có lịch sử, trả về 0 (hoặc số ban đầu lúc bàn giao phòng)
  return NextResponse.json({
    electricOld: lastReading?.electricNew || 0,
    waterOld: lastReading?.waterNew || 0
  });
}