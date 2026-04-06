import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. Lấy chi tiết một bản ghi chốt số
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Bắt buộc await trong Next.js 15

    const reading = await prisma.meterReading.findUnique({
      where: { id },
      include: { room: true }
    });

    if (!reading) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json(reading);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi Server" }, { status: 500 });
  }
}

// 2. Cập nhật chỉ số (Dùng PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { electricNew, waterNew, electricOld, waterOld } = body;

    const updated = await prisma.meterReading.update({
      where: { id },
      data: {
        electricNew: parseFloat(electricNew),
        waterNew: parseFloat(waterNew),
        electricOld: parseFloat(electricOld),
        waterOld: parseFloat(waterOld),
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi cập nhật" }, { status: 500 });
  }
}

// DELETE: Xóa bản ghi chốt số
export async function DELETE(
  request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      await prisma.meterReading.delete({
        where: { id }
      });
    return NextResponse.json({ message: "Đã xóa thành công" });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi khi xóa" }, { status: 500 });
  }
}