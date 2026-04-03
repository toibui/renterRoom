import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all contracts
export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        customer: true,
        birthTracking: true,
        type: true,

        // 🔥 chỉ lấy renew mới nhất
        renews: {
          orderBy: { renewNo: 'desc' },
          take: 1
        }
      },
      orderBy: {
        dateContract: 'desc'
      }
    });

    const now = new Date();

    const result = contracts.map(c => {
      const lastRenew = c.renews[0];

      // 🔥 tính ngày hết hạn
      let currentEndDate: Date | null = null;

      if (lastRenew) {
        currentEndDate = new Date(lastRenew.endDate);
      } else if (c.type?.duration) {
        const d = new Date(c.dateContract);
        d.setFullYear(d.getFullYear() + c.type.duration);
        currentEndDate = d;
      }

      // 🔥 trạng thái
      let status = 'unknown';

      if (currentEndDate) {
        const diffMonths =
          (currentEndDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24 * 30);

        if (diffMonths <= 0) status = 'expired';
        else if (diffMonths <= 6) status = 'expiring';
        else status = 'active';
      }

      return {
        ...c,
        currentEndDate,
        status, // 🔥 dùng cho UI luôn
        canRenew: status !== 'active' // 🔥 UI dùng luôn
      };
    });

    return NextResponse.json(result);

  } catch (err) {
    console.error('Error fetching contracts:', err);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

// POST create new contract
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 1️⃣ Validate customer & type
    const customerExists = await prisma.customer.findUnique({
      where: { id: data.customerId }
    });

    const typeExists = await prisma.type.findUnique({
      where: { id: data.typeId }
    });

    if (!customerExists || !typeExists) {
      return NextResponse.json(
        { error: 'customerId hoặc typeId không hợp lệ' },
        { status: 400 }
      );
    }

    // 2️⃣ Validate dateContract
    let contractDate = new Date();
    if (data.dateContract) {
      contractDate = new Date(data.dateContract);
      if (isNaN(contractDate.getTime())) {
        return NextResponse.json(
          { error: 'dateContract không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // 🔥 3️⃣ Auto tính endDate (optional)
    let endDate = null;
    if (typeExists.duration) {
      const d = new Date(contractDate);
      d.setFullYear(d.getFullYear() + typeExists.duration);
      endDate = d;
    }

    // 4️⃣ Create
    const newContract = await prisma.contract.create({
      data: {
        customerId: data.customerId,
        typeId: data.typeId,
        no: data.no || null,
        dateContract: contractDate,

        // 👇 thêm nếu bạn có field này

        price: data.price ?? null,
        promote: data.promote ?? null,

        birthTracking: {
          create: {
            status: 'planned',
            babiesCount: data.babiesCount || 1,
            hospitalName: data.hospitalName || null,
            hospitalAddress: data.hospitalAddress || null,
            edd: data.edd ? new Date(data.edd) : null
          }
        }
      },
      include: {
        customer: true,
        type: true,
        birthTracking: true,
        renews: true
      }
    });

    return NextResponse.json(newContract, { status: 201 });

  } catch (err) {
    console.error('Error creating contract:', err);
    return NextResponse.json(
      {
        error: 'Tạo contract thất bại',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}