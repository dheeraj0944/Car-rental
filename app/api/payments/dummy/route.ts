import { connectToDatabase } from "@/lib/mongodb"
import { Payment } from "@/models/payment"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectToDatabase()

    const { bookingId, amount, success: paymentSuccess } = await request.json()

    if (!bookingId || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const status = paymentSuccess ? "success" : "failed"

    const payment = await Payment.create({
      bookingId,
      amount,
      status,
    })

    return NextResponse.json({
      success: status === "success",
      message: status === "success" ? "Payment successful (dummy)" : "Payment failed (dummy)",
      payment,
    })
  } catch (error: any) {
    console.error("Dummy payment error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
