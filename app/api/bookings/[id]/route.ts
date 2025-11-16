import { connectToDatabase } from "@/lib/mongodb"
import { Booking } from "@/models/booking"
import { Car } from "@/models/car"
import { User } from "@/models/user"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 })
    }

    const booking = await Booking.findById(id)
      .populate("carId", "brand model pricePerDay images")
      .populate("userId", "name email")

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Check authorization (handle both populated and unpopulated userId types)
    const ownerId = (booking as any).userId && typeof (booking as any).userId === "object"
      ? ((booking as any).userId._id?.toString?.() || "")
      : (booking as any).userId?.toString?.() || ""
    if (decoded.role !== "admin" && ownerId !== decoded.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error("Get booking error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 })
    }

    const { status } = await request.json()

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    const booking = await Booking.findById(id)

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Only admin can update status
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    booking.status = status
    await booking.save()

    return NextResponse.json({
      message: "Booking updated successfully",
      booking,
    })
  } catch (error: any) {
    console.error("Update booking error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 })
    }

    const booking = await Booking.findById(id)

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Check authorization
    if (decoded.role !== "admin" && booking.userId.toString() !== decoded.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
    }

    await Booking.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Booking cancelled successfully",
    })
  } catch (error: any) {
    console.error("Delete booking error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
