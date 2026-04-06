import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper type để tái sử dụng
type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Lấy chi tiết hóa đơn
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        room: true,
        meterReading: true,
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Không tìm thấy hóa đơn" }, { status: 404 });
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error("Lỗi API Bill GET:", error);
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 });
  }
}

// PATCH: Cập nhật trạng thái thanh toán (Có thể Toggle qua lại)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        status: status, // 'PAID' hoặc 'PENDING'
        paidAt: status === 'PAID' ? new Date() : null, // Nếu trả về PENDING thì xóa ngày thanh toán
      },
    });

    return NextResponse.json(updatedBill);
  } catch (error) {
    return NextResponse.json({ error: "Không thể cập nhật trạng thái" }, { status: 500 });
  }
}

// DELETE: Xóa hóa đơn
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params; // CẦN THIẾT: Await ở đây

    await prisma.bill.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: "Đã xóa hóa đơn" });
  } catch (error) {
    console.error("Lỗi API Bill DELETE:", error);
    return NextResponse.json({ error: "Lỗi khi xóa" }, { status: 500 });
  }
}