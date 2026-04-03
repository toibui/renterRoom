import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET all types
export async function GET() {
  try {
    const types = await prisma.type.findMany({
      include: {
        contracts: true, // include related contracts
      },
    });

    return NextResponse.json(types);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch types' },
      { status: 500 }
    );
  }
}

// POST create new type
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Kiểm tra dữ liệu đầu vào
    if (!data.name || data.price === undefined|| data.duration === undefined) {
      return NextResponse.json(
        { error: 'Missing name, price, or duration' },
        { status: 400 }
      );
    }

    // Chuẩn bị giá trị price cho Prisma
    const priceValue = new Prisma.Decimal(data.price); 
    // Nếu schema dùng Float, thay bằng: const priceValue = Number(data.price);

    const newType = await prisma.type.create({
      data: {
        name: data.name,
        price: priceValue,
      },
    });

    return NextResponse.json(newType, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create type' },
      { status: 500 }
    );
  }
}