import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  // Lấy lịch sử chốt số của một phòng hoặc tất cả
  const readings = await prisma.meterReading.findMany({
    where: roomId ? { roomId } : {},
    include: { room: true, bill: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return NextResponse.json(readings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, month, year, electricOld, electricNew, waterOld, waterNew } = body;

    // 1. Tạo MeterReading
    const reading = await prisma.meterReading.create({
      data: {
        roomId,
        month: parseInt(month),
        year: parseInt(year),
        electricOld: parseFloat(electricOld),
        electricNew: parseFloat(electricNew),
        waterOld: parseFloat(waterOld),
        waterNew: parseFloat(waterNew),
      },
    });

    // 2. Tự động tạo Bill nháp (Logic bổ sung)
    // Bạn có thể thêm logic lấy giá từ PriceConfig ở đây để tính tổng tiền ngay khi chốt số

    return NextResponse.json(reading);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi lưu chỉ số" }, { status: 500 });
  }
}