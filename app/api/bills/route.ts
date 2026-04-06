import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const bills = await prisma.bill.findMany({
    include: { room: true, meterReading: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(bills);
}

export async function POST(request: Request) {
  try {
    const { readingId } = await request.json();

    // 1. Lấy thông tin chốt số và phòng
    const reading = await prisma.meterReading.findUnique({
      where: { id: readingId },
      include: { room: true }
    });

    if (!reading) return NextResponse.json({ error: "Không tìm thấy chỉ số" }, { status: 404 });

    // 2. Lấy cấu hình giá đang hoạt động (Active)
    const priceConfig = await prisma.priceConfig.findFirst({
      where: { isActive: true }
    });

    if (!priceConfig) return NextResponse.json({ error: "Chưa thiết lập đơn giá điện nước" }, { status: 400 });

    // 3. Tính toán tiền
    const electricUsage = reading.electricNew - reading.electricOld;
    const waterUsage = reading.waterNew - reading.waterOld;
    
    const electricTotal = electricUsage * priceConfig.electricPrice;
    const waterTotal = waterUsage * priceConfig.waterPrice;
    const totalAmount = electricTotal + waterTotal + reading.room.basePrice;

    // 4. Tạo hóa đơn
    const bill = await prisma.bill.create({
      data: {
        roomId: reading.roomId,
        readingId: reading.id,
        appliedElectricPrice: priceConfig.electricPrice,
        appliedWaterPrice: priceConfig.waterPrice,
        appliedBasePrice: reading.room.basePrice,
        totalAmount: totalAmount,
        status: 'PENDING',
      }
    });

    return NextResponse.json(bill);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo hóa đơn" }, { status: 500 });
  }
}