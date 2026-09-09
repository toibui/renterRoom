import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, monthYear, oldElectric, newElectric, electricPrice, oldWater, newWater, waterPrice } = body;

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ error: 'Phòng không tồn tại' }, { status: 404 });

    const electricUsage = Math.max(0, newElectric - oldElectric);
    const waterUsage = Math.max(0, newWater - oldWater);
    const totalAmount = room.rentPrice + (electricUsage * electricPrice) + (waterUsage * waterPrice);
    const existingInvoice = await prisma.invoice.findUnique({
      where: { roomId_monthYear: { roomId, monthYear } },
      select: { id: true, status: true },
    });

    if (existingInvoice?.status === 'PAID') {
      return NextResponse.json(
        { error: `Hóa đơn phòng ${room.roomNumber} kỳ ${monthYear} đã thanh toán và không thể sửa hoặc xóa.` },
        { status: 409 },
      );
    }

    const invoice = await prisma.invoice.upsert({
      where: { roomId_monthYear: { roomId, monthYear } },
      update: { oldElectric, newElectric, electricPrice, oldWater, newWater, waterPrice, totalAmount },
      create: { roomId, monthYear, oldElectric, newElectric, electricPrice, oldWater, newWater, waterPrice, totalAmount },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lưu chỉ số' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { roomId, monthYear } = await req.json();
    if (!roomId || !monthYear) {
      return NextResponse.json({ error: 'Thiếu phòng hoặc kỳ hóa đơn' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { roomId_monthYear: { roomId, monthYear } },
      include: { room: { select: { roomNumber: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Không tìm thấy hóa đơn của kỳ này' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: `Hóa đơn phòng ${invoice.room.roomNumber} kỳ ${monthYear} đã thanh toán nên không thể xóa.` },
        { status: 409 },
      );
    }

    await prisma.invoice.delete({ where: { id: invoice.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa chỉ số điện nước' }, { status: 500 });
  }
}
