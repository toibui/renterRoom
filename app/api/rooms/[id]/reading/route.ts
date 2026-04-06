import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Đảm bảo đường dẫn prisma chuẩn của bạn

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id; // Lấy trực tiếp ID từ URL
    const body = await request.json();
    
    const { 
      month, 
      year, 
      electricOld, 
      electricNew, 
      waterOld, 
      waterNew 
    } = body;

    // 1. Kiểm tra phòng có tồn tại không
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Không tìm thấy phòng này" },
        { status: 404 }
      );
    }

    // 2. Tạo MeterReading gắn với roomId từ params
    const reading = await prisma.meterReading.create({
      data: {
        roomId: roomId,
        month: parseInt(month.toString()),
        year: parseInt(year.toString()),
        electricOld: parseFloat(electricOld.toString()),
        electricNew: parseFloat(electricNew.toString()),
        waterOld: parseFloat(waterOld.toString()),
        waterNew: parseFloat(waterNew.toString()),
      },
    });

    // 3. Logic bổ sung: Tự động tạo Bill nháp (Nếu cần)
    // Bạn có thể lấy PriceConfig mới nhất tại đây để nhân thành tiền
    /*
    const config = await prisma.priceConfig.findFirst({ where: { isActive: true } });
    if (config) {
       await prisma.bill.create({
         data: {
           roomId,
           meterReadingId: reading.id,
           totalAmount: (electricNew - electricOld) * config.electricPrice + ...
           status: "DRAFT"
         }
       });
    }
    */

    return NextResponse.json(reading, { status: 201 });

  } catch (error: any) {
    console.error("Error creating reading:", error);
    
    // Xử lý lỗi SSL hoặc lỗi kết nối DB
    if (error.message.includes("certificate")) {
       return NextResponse.json(
         { error: "Lỗi kết nối SSL Database. Vui lòng kiểm tra sslmode trong .env" },
         { status: 500 }
       );
    }

    return NextResponse.json(
      { error: "Lỗi khi lưu chỉ số điện nước" },
      { status: 500 }
    );
  }
}