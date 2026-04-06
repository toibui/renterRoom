import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest, // Sử dụng NextRequest để đồng bộ với kiểu của Next.js
  { params }: { params: Promise<{ id: string }> } // Chuyển params thành Promise
) {
  try {
    // 1. Await params trước khi sử dụng
    const { id: roomId } = await params; 
    
    const body = await request.json();
    
    const { 
      month, 
      year, 
      electricOld, 
      electricNew, 
      waterOld, 
      waterNew 
    } = body;

    // 2. Kiểm tra phòng có tồn tại không
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Không tìm thấy phòng này" },
        { status: 404 }
      );
    }

    // 3. Tạo MeterReading gắn với roomId từ params
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

    return NextResponse.json(reading, { status: 201 });

  } catch (error: any) {
    console.error("Error creating reading:", error);
    
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