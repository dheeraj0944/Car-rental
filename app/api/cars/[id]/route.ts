import { connectToDatabase } from "@/lib/mongodb"
import { Car } from "@/models/car"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid car ID" }, { status: 400 })
    }

    const car = await Car.findById(id)
    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 })
    }

    return NextResponse.json({ car })
  } catch (error: any) {
    console.error("Get car error:", error)
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectToDatabase()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid car ID" }, { status: 400 })
    }

    const { brand, model, pricePerDay, type, seats, fuelType, images, available } = await request.json()

    const car = await Car.findByIdAndUpdate(
      id,
      { brand, model, pricePerDay, type, seats, fuelType, images, available },
      { new: true },
    )

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Car updated successfully",
      car,
    })
  } catch (error: any) {
    console.error("Update car error:", error)
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectToDatabase()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid car ID" }, { status: 400 })
    }

    const car = await Car.findByIdAndDelete(id)

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Car deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete car error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
