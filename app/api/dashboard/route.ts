import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing from/to query params" },
        { status: 400 }
      )
    }

    const fromDate = new Date(from)
    fromDate.setHours(0, 0, 0, 0)

    const toDate = new Date(to)
    toDate.setHours(23, 59, 59, 999)

    const [
      totalCustomers,
      totalConsultings,
      totalUniqueConsultedCustomers,
      totalContracts,
      totalSamples,

      // 👇 NEW
      contractRevenue,
      renewRevenue,
      renewCount
    ] = await Promise.all([

      // 1️⃣ Khách hàng
      prisma.customer.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate }
        }
      }),

      // 2️⃣ Tư vấn
      prisma.consulting.count({
        where: {
          createdAt: { gte: fromDate, lte: toDate }
        }
      }),

      // 3️⃣ Unique consulted
      (async () => {
        const grouped = await prisma.consulting.groupBy({
          by: ["customerId"],
          where: {
            createdAt: { gte: fromDate, lte: toDate }
          }
        })
        return grouped.length
      })(),

      // 4️⃣ Contract mới
      prisma.contract.count({
        where: {
          dateContract: { gte: fromDate, lte: toDate }
        }
      }),

      // 5️⃣ Sample
      prisma.birthTracking.count({
        where: {
          actualBirthAt: {
            not: null,
            gte: fromDate,
            lte: toDate
          }
        }
      }),

      // 💰 6️⃣ Doanh thu contract
      prisma.contract.aggregate({
        _sum: { price: true },
        where: {
          dateContract: { gte: fromDate, lte: toDate }
        }
      }),

      // 💰 7️⃣ Doanh thu renew
      prisma.renewContract.aggregate({
        _sum: { price: true },
        where: {
          startDate: { gte: fromDate, lte: toDate }
        }
      }),

      // 🔢 8️⃣ Số lần renew
      prisma.renewContract.count({
        where: {
          startDate: { gte: fromDate, lte: toDate }
        }
      })
    ])

    // 💰 Tổng doanh thu
    const toNumber = (val: any) => Number(val || 0);

    const revenue =
      toNumber(contractRevenue._sum.price) +
      toNumber(renewRevenue._sum.price);

    // 🔢 Tổng deal (nếu bạn muốn tính cả renew)
    const totalDeals = totalContracts + renewCount

    // 📊 KPI
    const consultRate =
      totalCustomers > 0
        ? (totalUniqueConsultedCustomers / totalCustomers) * 100
        : 0

    const conversionRate =
      totalUniqueConsultedCustomers > 0
        ? totalContracts / totalUniqueConsultedCustomers
        : 0

    const sampleRate =
      totalContracts > 0
        ? (totalSamples / totalContracts) * 100
        : 0

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalConsultings,
        totalUniqueConsultedCustomers,
        totalContracts,
        totalSamples,

        // 👇 NEW
        renewCount,
        totalDeals,

        revenue,

        consultRate: Number(consultRate.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        sampleRate: Number(sampleRate.toFixed(2))
      }
    })
  } catch (error: any) {
    console.error("Dashboard API Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error"
      },
      { status: 500 }
    )
  }
}