import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (Array.isArray(body.entries)) {
      const { entries, monthYear, electricPrice, waterPrice } = body;
      if (!monthYear || entries.length === 0) {
        return NextResponse.json({ error: 'Thiếu kỳ hóa đơn hoặc dữ liệu phòng' }, { status: 400 });
      }

      const normalizedEntries = entries.map((entry: any) => ({
        roomId: entry.roomId,
        oldElectric: Number(entry.oldElectric),
        newElectric: Number(entry.newElectric),
        oldWater: Number(entry.oldWater),
        newWater: Number(entry.newWater),
      }));
      const hasInvalidEntry = normalizedEntries.some((entry: any) =>
        !entry.roomId || Object.values(entry).some((value) => typeof value === 'number' && (!Number.isFinite(value) || value < 0)),
      );
      if (hasInvalidEntry || !Number.isFinite(Number(electricPrice)) || !Number.isFinite(Number(waterPrice))) {
        return NextResponse.json({ error: 'Chỉ số và đơn giá phải là số hợp lệ không âm' }, { status: 400 });
      }

      const roomIds = normalizedEntries.map((entry: any) => entry.roomId);
      const rooms = await prisma.room.findMany({ where: { id: { in: roomIds } } });
      if (rooms.length !== new Set(roomIds).size) {
        return NextResponse.json({ error: 'Có phòng không tồn tại trong dữ liệu nhập' }, { status: 404 });
      }

      const existingInvoices = await prisma.invoice.findMany({
        where: { roomId: { in: roomIds }, monthYear },
        select: { roomId: true, status: true },
      });
      const paidInvoice = existingInvoices.find((invoice) => invoice.status === 'PAID');
      if (paidInvoice) {
        const paidRoom = rooms.find((room) => room.id === paidInvoice.roomId);
        return NextResponse.json({ error: `Hóa đơn phòng ${paidRoom?.roomNumber} kỳ ${monthYear} đã thanh toán và không thể sửa.` }, { status: 409 });
      }

      await prisma.$transaction(async (transaction) => {
        for (const entry of normalizedEntries) {
          const room = rooms.find((item) => item.id === entry.roomId)!;
          const electricUsage = Math.max(0, entry.newElectric - entry.oldElectric);
          const waterUsage = Math.max(0, entry.newWater - entry.oldWater);
          const totalAmount = room.rentPrice + (electricUsage * Number(electricPrice)) + (waterUsage * Number(waterPrice));
          await transaction.invoice.upsert({
            where: { roomId_monthYear: { roomId: entry.roomId, monthYear } },
            update: { ...entry, electricPrice: Number(electricPrice), waterPrice: Number(waterPrice), totalAmount },
            create: { ...entry, monthYear, electricPrice: Number(electricPrice), waterPrice: Number(waterPrice), totalAmount },
          });
        }
      });

      return NextResponse.json({ success: true, count: normalizedEntries.length });
    }

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
