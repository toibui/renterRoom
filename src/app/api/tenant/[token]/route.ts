import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const room = await prisma.room.findUnique({
      where: { accessToken: params.token },
      include: {
        invoices: { orderBy: { monthYear: 'desc' } },
        tenants: { where: { isArchived: false }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!room) return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });
    const property = await prisma.propertyInfo.findUnique({ where: { id: 'main' } });
    return NextResponse.json({ room, property });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi kết nối' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    const room = await prisma.room.findUnique({ where: { accessToken: params.token } });
    if (!room) return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });

    const { fullName, phone, identityCard, isPrimary, replaceExisting } = await req.json();
    const tenant = await prisma.$transaction(async (transaction) => {
      if (replaceExisting) {
        await transaction.tenant.updateMany({
          where: { roomId: room.id, isArchived: false },
          data: { isArchived: true, archivedAt: new Date() },
        });
      }

      return transaction.tenant.create({
        data: { fullName, phone, identityCard, isPrimary: Boolean(isPrimary), roomId: room.id },
      });
    });
    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lưu thông tin' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  try {
    const room = await prisma.room.findUnique({ where: { accessToken: params.token } });
    if (!room) return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });

    const { tenantId, fullName, phone, identityCard, isPrimary } = await req.json();
    if (!tenantId || !fullName || !phone || !identityCard) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin khách hàng' }, { status: 400 });
    }

    const tenant = await prisma.tenant.updateMany({
      where: { id: tenantId, roomId: room.id, isArchived: false },
      data: { fullName, phone, identityCard, isPrimary: Boolean(isPrimary) },
    });
    if (tenant.count === 0) return NextResponse.json({ error: 'Không tìm thấy khách đang ở trong phòng' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật thông tin khách hàng' }, { status: 500 });
  }
}
