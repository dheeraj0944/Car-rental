import { connectToDatabase } from "@/lib/mongodb"
import { Booking } from "@/models/booking"
import { Car } from "@/models/car"
import { User } from "@/models/user"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectToDatabase()

    let bookings

    if (decoded.role === "admin") {
      // Admin sees all bookings
      bookings = await Booking.find()
        .populate("userId", "name email")
        .populate("carId", "brand model")
        .sort({ createdAt: -1 })
    } else {
      // Users see only their bookings
      bookings = await Booking.find({ userId: decoded.id })
        .populate("carId", "brand model pricePerDay")
        .sort({ createdAt: -1 })
    }

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error("Get bookings error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token) as any
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectToDatabase()

    const { carId, startDate, endDate } = await request.json()

    if (!carId || !startDate || !endDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return NextResponse.json({ message: "Invalid car ID" }, { status: 400 })
    }

    const car = await Car.findById(carId)
    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (days <= 0) {
      return NextResponse.json({ message: "End date must be after start date" }, { status: 400 })
    }

    const totalPrice = car.pricePerDay * days

    const booking = await Booking.create({
      userId: decoded.id,
      carId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: "pending",
    })

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Create booking error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
