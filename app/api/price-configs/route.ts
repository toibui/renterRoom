import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy cấu hình giá hiện đang hoạt động (hoặc danh sách lịch sử)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const getAll = searchParams.get('all') === 'true';

    if (getAll) {
      // Lấy toàn bộ lịch sử thay đổi giá
      const history = await prisma.priceConfig.findMany({
        orderBy: { effectiveDate: 'desc' },
      });
      return NextResponse.json(history);
    }

    // Mặc định: Chỉ lấy cấu hình đang hoạt động (isActive: true)
    const activeConfig = await prisma.priceConfig.findFirst({
      where: { isActive: true },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!activeConfig) {
      return NextResponse.json(
        { error: 'Chưa có cấu hình giá nào được thiết lập' },
        { status: 404 }
      );
    }

    return NextResponse.json(activeConfig);
  } catch (err) {
    console.error('Error fetching price config:', err);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}

// POST: Tạo cấu hình giá mới
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1️⃣ Validate dữ liệu
    const electricPrice = parseFloat(data.electricPrice);
    const waterPrice = parseFloat(data.waterPrice);

    if (isNaN(electricPrice) || isNaN(waterPrice)) {
      return NextResponse.json(
        { error: 'Đơn giá điện và nước phải là số hợp lệ' },
        { status: 400 }
      );
    }

    // 2️⃣ Xử lý Logic "Chỉ một bản ghi Active"
    // Nếu bản ghi mới được set isActive: true (mặc định), ta phải tắt các bản ghi cũ
    const shouldBeActive = data.isActive ?? true;

    if (shouldBeActive) {
      // Transaction: Đảm bảo tất cả bản ghi cũ về false trước khi tạo mới
      await prisma.$transaction([
        prisma.priceConfig.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        }),
        prisma.priceConfig.create({
          data: {
            electricPrice,
            waterPrice,
            effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
            isActive: true,
          },
        }),
      ]);
      
      return NextResponse.json({ message: 'Cập nhật giá mới thành công' }, { status: 201 });
    }

    // Nếu tạo bản ghi nhưng không kích hoạt ngay (chỉ lưu nháp/lịch sử)
    const newConfig = await prisma.priceConfig.create({
      data: {
        electricPrice,
        waterPrice,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
        isActive: false,
      },
    });

    return NextResponse.json(newConfig, { status: 201 });
  } catch (err) {
    console.error('Error creating price config:', err);
    return NextResponse.json({ error: 'Không thể tạo cấu hình giá' }, { status: 500 });
  }
}