import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const propertyId = 'main';

export async function GET() {
  try {
    const property = await prisma.propertyInfo.findUnique({ where: { id: propertyId } });
    return NextResponse.json({ property });
  } catch (error) {
    console.error('GET /api/admin/property failed:', error);
    return NextResponse.json({ error: 'Lỗi lấy thông tin nhà trọ' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu thông tin nhà trọ không hợp lệ' }, { status: 400 });
    }

    const landlordName = String(body.landlordName || '').trim();
    const phone = String(body.phone || '').trim();
    const houseNumber = String(body.houseNumber || '').trim();
    const address = String(body.address || '').trim();
    const bankId = String(body.bankId || '').trim().toUpperCase();
    const accountNo = String(body.accountNo || '').trim();
    const accountName = String(body.accountName || '').trim();
    const electricPrice = Number(body.electricPrice);
    const waterPrice = Number(body.waterPrice);

    if (!landlordName || !phone || !houseNumber || !address || !bankId || !accountNo || !accountName) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin nhà trọ và tài khoản nhận tiền' }, { status: 400 });
    }
    if (!/^\d+$/.test(accountNo)) {
      return NextResponse.json({ error: 'Số tài khoản chỉ được chứa chữ số' }, { status: 400 });
    }
    if (!Number.isFinite(electricPrice) || electricPrice < 0 || !Number.isFinite(waterPrice) || waterPrice < 0) {
      return NextResponse.json({ error: 'Giá điện và giá nước phải là số hợp lệ không âm' }, { status: 400 });
    }

    const property = await prisma.propertyInfo.upsert({
      where: { id: propertyId },
      update: { landlordName, phone, houseNumber, address, bankId, accountNo, accountName, electricPrice, waterPrice },
      create: { id: propertyId, landlordName, phone, houseNumber, address, bankId, accountNo, accountName, electricPrice, waterPrice },
    });

    return NextResponse.json({ success: true, property });
  } catch (error) {
    console.error('PUT /api/admin/property failed:', error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Lỗi lưu thông tin nhà trọ' },
      { status: 500 },
    );
  }
}