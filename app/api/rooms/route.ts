import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all rooms - Lấy danh sách phòng và trạng thái thanh toán
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        // Lấy chỉ số điện nước mới nhất để hiển thị/so sánh
        meterReadings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        // Lấy hóa đơn gần nhất để xem đã thanh toán chưa
        bills: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        roomNumber: 'asc',
      },
    });

    const result = rooms.map((room) => {
      const lastReading = room.meterReadings[0] || null;
      const lastBill = room.bills[0] || null;

      // Xác định trạng thái phòng dựa trên hóa đơn
      let paymentStatus = 'no_bill'; // Chưa có hóa đơn nào
      if (lastBill) {
        paymentStatus = lastBill.status; // PENDING, PAID, OVERDUE
      }

      return {
        ...room,
        lastReading,
        lastBill,
        paymentStatus,
        // UI có thể dùng flag này để nhắc nhở nhập số điện tháng mới
        needsReading: !lastReading || new Date(lastReading.createdAt).getMonth() !== new Date().getMonth(),
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách phòng' },
      { status: 500 }
    );
  }
}

// POST create new room - Tạo phòng mới
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1️⃣ Validate dữ liệu bắt buộc
    if (!data.roomNumber || !data.basePrice) {
      return NextResponse.json(
        { error: 'Số phòng và giá phòng là bắt buộc' },
        { status: 400 }
      );
    }

    // 2️⃣ Kiểm tra trùng số phòng
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber: data.roomNumber },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Số phòng này đã tồn tại' },
        { status: 400 }
      );
    }

    // 3️⃣ Tạo phòng
    const newRoom = await prisma.room.create({
      data: {
        roomNumber: data.roomNumber,
        tenantName: data.tenantName || null,
        tenantEmail: data.tenantEmail || null,
        tenantPhone: data.tenantPhone || null,
        basePrice: parseFloat(data.basePrice),
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (err) {
    console.error('Error creating room:', err);
    return NextResponse.json(
      {
        error: 'Tạo phòng thất bại',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}