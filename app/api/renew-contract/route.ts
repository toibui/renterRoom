import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { body } from 'framer-motion/m';

// GET all renews (kèm contract + customer nếu cần)
export async function GET() {
  try {
    const renews = await prisma.renewContract.findMany({
      include: {
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

    // ✅ Destructure đúng (FIX lỗi body.typeId)
    const { contractId, price, startDate, endDate, typeId } = data;

    // =========================
    // 1️⃣ Validate input
    // =========================
    if (!contractId) {
      return NextResponse.json(
        { error: 'Thiếu contractId' },
        { status: 400 }
      );
    }

    if (!typeId) {
      return NextResponse.json(
        { error: 'Thiếu typeId' },
        { status: 400 }
      );
    }

    if (!price || isNaN(Number(price))) {
      return NextResponse.json(
        { error: 'price không hợp lệ' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'startDate hoặc endDate không hợp lệ' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'endDate phải lớn hơn startDate' },
        { status: 400 }
      );
    }

    // =========================
    // 2️⃣ Check contract tồn tại
    // =========================
    const contractExists = await prisma.contract.findUnique({
      where: { id: String(contractId) }
    });

    if (!contractExists) {
      return NextResponse.json(
        { error: 'contractId không hợp lệ' },
        { status: 400 }
      );
    }

    // =========================
    // 3️⃣ Check type tồn tại
    // =========================
    const typeExists = await prisma.type.findUnique({
      where: { id: String(typeId) }
    });

    if (!typeExists) {
      return NextResponse.json(
        { error: 'typeId không hợp lệ' },
        { status: 400 }
      );
    }

    // =========================
    // 4️⃣ Tính renewNo (transaction để tránh race condition)
    // =========================
    const newRenew = await prisma.$transaction(async (tx) => {
      const lastRenew = await tx.renewContract.findFirst({
        where: { contractId: String(contractId) },
        orderBy: { renewNo: 'desc' }
      });

      const renewNo = lastRenew ? lastRenew.renewNo + 1 : 1;

      // =========================
      // 5️⃣ Create renew
      // =========================
      return await tx.renewContract.create({
        data: {
          contract: {
            connect: { id: String(contractId) }
          },
          type: {
            connect: { id: String(typeId) }
          },
          renewNo,
          price: new Prisma.Decimal(price),
          startDate: start,
          endDate: end
        }
      });
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