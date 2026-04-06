import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET room by ID (kèm MeterReadings và Bills mới nhất)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id)
    return NextResponse.json({ error: 'ID phòng là bắt buộc' }, { status: 400 });

  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        // Lấy lịch sử chỉ số điện nước, sắp xếp mới nhất lên đầu
        meterReadings: {
          orderBy: { createdAt: 'desc' },
        },
        // Lấy danh sách hóa đơn
        bills: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!room)
      return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });

    return NextResponse.json(room);
  } catch (err) {
    console.error('Error fetching room:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}

/**
 * PUT update room by ID
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id)
    return NextResponse.json({ error: 'ID phòng là bắt buộc' }, { status: 400 });

  try {
    const data = await req.json();

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        roomNumber: data.roomNumber,
        tenantName: data.tenantName ?? null,
        tenantEmail: data.tenantEmail ?? null,
        tenantPhone: data.tenantPhone ?? null,
        basePrice: data.basePrice ? parseFloat(data.basePrice) : undefined,
        isActive: data.isActive ?? undefined,
      },
      include: {
        meterReadings: { take: 1, orderBy: { createdAt: 'desc' } },
        bills: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (err: any) {
    console.error('Error updating room:', err);

    // Xử lý lỗi Prisma: Không tìm thấy bản ghi
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Không tìm thấy phòng để cập nhật' }, { status: 404 });
    }
    // Xử lý lỗi trùng số phòng (Unique constraint)
    if (err.code === 'P2002') {
        return NextResponse.json({ error: 'Số phòng này đã tồn tại' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}

/**
 * DELETE room by ID
 */
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id)
    return NextResponse.json({ error: 'ID phòng là bắt buộc' }, { status: 400 });

  try {
    // 🔥 Nghiệp vụ: Kiểm tra xem phòng đã có dữ liệu hóa đơn hoặc chỉ số chưa
    // Nếu đã có giao dịch tài chính thì không nên cho xóa thẳng để tránh mất dữ liệu đối soát
    const billCount = await prisma.bill.count({
      where: { roomId: id }
    });

    if (billCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa phòng đã có lịch sử hóa đơn. Hãy chuyển trạng thái sang ngưng hoạt động (Inactive).' },
        { status: 400 }
      );
    }

    await prisma.room.delete({ where: { id } });

    return NextResponse.json({ message: 'Đã xóa phòng thành công' });

  } catch (err) {
    console.error('Error deleting room:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}