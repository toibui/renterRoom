import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Định nghĩa interface để đồng bộ với Next.js 15
interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET Type by ID (kèm danh sách contracts nếu cần)
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const typeData = await prisma.type.findUnique({
      where: { id },
      include: {
        contracts: true, // Bao gồm danh sách hợp đồng thuộc loại này
      },
    });

    if (!typeData) {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 });
    }

    return NextResponse.json(typeData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT update Type by ID
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const data = await req.json();

    const updatedType = await prisma.type.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        // Chuyển đổi sang Decimal cho Prisma nếu có dữ liệu
        price: data.price !== undefined ? Number(data.price) : undefined,
        duration: data.duration !== undefined ? Number(data.duration) : undefined,
      },
    });

    return NextResponse.json(updatedType);
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE Type by ID
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    // Lưu ý: Nếu có ràng buộc khóa ngoại, Type chỉ xóa được khi không còn Contract nào tham chiếu tới
    await prisma.type.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Type deleted successfully' });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Type not found' }, { status: 404 });
    }
    // Lỗi P2003 là lỗi vi phạm ràng buộc khóa ngoại (Foreign key constraint)
    if (err.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete Type because it is being used by contracts' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}