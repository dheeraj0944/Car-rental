import { connectToDatabase } from "@/lib/mongodb"
import { Car } from "@/models/car"
import { verifyToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get filter parameters
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get("brand")
    const fuelType = searchParams.get("fuelType")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const seats = searchParams.get("seats")

    // Build filter object
    const filter: any = { available: true }
    if (brand) filter.brand = { $regex: brand, $options: "i" }
    if (fuelType) filter.fuelType = fuelType
    if (seats) filter.seats = { $gte: Number.parseInt(seats) }
    if (minPrice || maxPrice) {
      filter.pricePerDay = {}
      if (minPrice) filter.pricePerDay.$gte = Number.parseInt(minPrice)
      if (maxPrice) filter.pricePerDay.$lte = Number.parseInt(maxPrice)
    }

    const cars = await Car.find(filter).sort({ createdAt: -1 })
    return NextResponse.json({ cars })
  } catch (error: any) {
    console.error("Get cars error:", error)
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectToDatabase()

    const { brand, model, pricePerDay, type, seats, fuelType, images } = await request.json()

    const car = await Car.create({
      brand,
      model,
      pricePerDay,
      type,
      seats,
      fuelType,
      images: images || [],
    })

    return NextResponse.json(
      {
        message: "Car added successfully",
        car,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Create car error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
