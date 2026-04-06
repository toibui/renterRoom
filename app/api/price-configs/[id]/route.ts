import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET price-config by ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const config = await prisma.priceConfig.findUnique({
      where: { id },
    });

    if (!config) {
      return NextResponse.json({ error: 'Không tìm thấy cấu hình giá' }, { status: 404 });
    }

    return NextResponse.json(config);
  } catch (err) {
    console.error('Error fetching price config:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}

/**
 * PUT update price-config by ID
 * Lưu ý: Nếu cập nhật isActive = true, cần tắt các bản ghi khác.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await req.json();
    const electricPrice = data.electricPrice ? parseFloat(data.electricPrice) : undefined;
    const waterPrice = data.waterPrice ? parseFloat(data.waterPrice) : undefined;
    const shouldBeActive = data.isActive === true;

    // Nếu người dùng muốn kích hoạt bản ghi này làm giá hiện hành
    if (shouldBeActive) {
      const updatedConfig = await prisma.$transaction(async (tx) => {
        // 1. Tắt tất cả các cấu hình đang active khác
        await tx.priceConfig.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });

        // 2. Cập nhật bản ghi hiện tại và bật nó lên
        return tx.priceConfig.update({
          where: { id },
          data: {
            electricPrice,
            waterPrice,
            isActive: true,
            effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
          },
        });
      });
      return NextResponse.json(updatedConfig);
    }

    // Cập nhật thông thường (không thay đổi trạng thái active hoặc chuyển sang false)
    const updatedConfig = await prisma.priceConfig.update({
      where: { id },
      data: {
        electricPrice,
        waterPrice,
        isActive: data.isActive ?? undefined,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
      },
    });

    return NextResponse.json(updatedConfig);
  } catch (err: any) {
    console.error('Error updating price config:', err);
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Không tìm thấy cấu hình để cập nhật' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}

/**
 * DELETE price-config by ID
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Kiểm tra xem có phải bản ghi đang hoạt động không
    const config = await prisma.priceConfig.findUnique({ where: { id } });
    
    if (config?.isActive) {
      return NextResponse.json(
        { error: 'Không thể xóa cấu hình giá đang hoạt động. Hãy kích hoạt một giá mới trước.' },
        { status: 400 }
      );
    }

    // 2. Kiểm tra xem cấu hình này có đang được "dính" vào hóa đơn nào không
    // Lưu ý: Nếu trong model Bill bạn có lưu priceConfigId thì nên check:
    /*
    const relatedBills = await prisma.bill.count({ where: { priceConfigId: id } });
    if (relatedBills > 0) {
       return NextResponse.json({ error: 'Giá này đã được dùng cho hóa đơn cũ, không nên xóa.' }, { status: 400 });
    }
    */

    await prisma.priceConfig.delete({ where: { id } });

    return NextResponse.json({ message: 'Đã xóa cấu hình giá thành công' });
  } catch (err) {
    console.error('Error deleting price config:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}