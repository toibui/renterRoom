import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all renews
export async function GET() {
  try {
    const renews = await prisma.renewContract.findMany({
      include: {
        type: true, // 👈 thêm type của renew
        contract: {
          include: {
            customer: true,
            type: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json(renews);

  } catch (err) {
    console.error('Error fetching renew contracts:', err);
    return NextResponse.json(
      { error: 'Failed to fetch renew contracts' },
      { status: 500 }
    );
  }
}

// POST create renew
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      contractId,
      typeId,
      promote = 0,
      price,
      startDate,
      endDate
    } = data;

    // 1️⃣ Validate contract
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'contractId không hợp lệ' },
        { status: 400 }
      );
    }

    // 2️⃣ Validate type
    const type = await prisma.type.findUnique({
      where: { id: typeId }
    });

    if (!type) {
      return NextResponse.json(
        { error: 'typeId không hợp lệ' },
        { status: 400 }
      );
    }

    // 3️⃣ Validate date
    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: 'startDate không hợp lệ' },
        { status: 400 }
      );
    }

    // 🔥 Auto endDate nếu không gửi
    let end: Date;

    if (endDate) {
      end = new Date(endDate);

      if (isNaN(end.getTime()) || end <= start) {
        return NextResponse.json(
          { error: 'endDate không hợp lệ' },
          { status: 400 }
        );
      }
    } else {
      if (!type.duration) {
        return NextResponse.json(
          { error: 'Type chưa có duration để tính endDate' },
          { status: 400 }
        );
      }

      end = new Date(start);
      end.setFullYear(end.getFullYear() + type.duration);
    }

    // 4️⃣ Tính giá
    const basePrice = Number(type.price || 0);
    const finalPrice =
      price ?? Math.max(basePrice - Number(promote || 0), 0);

    // 5️⃣ renewNo
    const lastRenew = await prisma.renewContract.findFirst({
      where: { contractId },
      orderBy: { renewNo: 'desc' }
    });

    const renewNo = lastRenew ? lastRenew.renewNo + 1 : 1;

    // 6️⃣ Create
    const newRenew = await prisma.renewContract.create({
      data: {
        contractId,
        typeId,
        renewNo,

        basePrice,
        promote,
        price: finalPrice,

        startDate: start,
        endDate: end
      },
      include: {
        type: true,
        contract: {
          include: {
            customer: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(newRenew, { status: 201 });

  } catch (err) {
    console.error('Error creating renew contract:', err);
    return NextResponse.json(
      {
        error: 'Tạo renew thất bại',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}