import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const propertyId = 'main';

export async function GET() {
  try {
    const property = await prisma.propertyInfo.findUnique({ where: { id: propertyId } });
    return NextResponse.json({ property });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lấy thông tin nhà trọ' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const landlordName = String(body.landlordName || '').trim();
    const phone = String(body.phone || '').trim();
    const houseNumber = String(body.houseNumber || '').trim();
    const address = String(body.address || '').trim();

    if (!landlordName || !phone || !houseNumber || !address) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin nhà trọ' }, { status: 400 });
    }

    const property = await prisma.propertyInfo.upsert({
      where: { id: propertyId },
      update: { landlordName, phone, houseNumber, address },
      create: { id: propertyId, landlordName, phone, houseNumber, address },
    });

    return NextResponse.json({ success: true, property });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi lưu thông tin nhà trọ' }, { status: 500 });
  }
}