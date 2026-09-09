import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ invoices });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy hóa đơn' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { invoiceId, status } = await req.json();
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });
    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật hóa đơn' }, { status: 500 });
  }
}
