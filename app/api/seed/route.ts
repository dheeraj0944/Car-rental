import { connectToDatabase } from "@/lib/mongodb"
import { Car } from "@/models/car"
import { type NextRequest, NextResponse } from "next/server"

const dummyCars = [
  {
    brand: "Toyota",
    model: "Camry",
    pricePerDay: 45,
    type: "sedan",
    seats: 5,
    fuelType: "hybrid",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Honda",
    model: "Accord",
    pricePerDay: 48,
    type: "sedan",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Tesla",
    model: "Model 3",
    pricePerDay: 75,
    type: "sedan",
    seats: 5,
    fuelType: "electric",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "BMW",
    model: "3 Series",
    pricePerDay: 85,
    type: "sedan",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Mercedes-Benz",
    model: "C-Class",
    pricePerDay: 90,
    type: "sedan",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Audi",
    model: "A4",
    pricePerDay: 88,
    type: "sedan",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0ad6?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Ford",
    model: "Explorer",
    pricePerDay: 65,
    type: "suv",
    seats: 7,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Jeep",
    model: "Grand Cherokee",
    pricePerDay: 70,
    type: "suv",
    seats: 5,
    fuelType: "diesel",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Toyota",
    model: "RAV4",
    pricePerDay: 55,
    type: "suv",
    seats: 5,
    fuelType: "hybrid",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Honda",
    model: "CR-V",
    pricePerDay: 52,
    type: "suv",
    seats: 5,
    fuelType: "hybrid",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Nissan",
    model: "Altima",
    pricePerDay: 42,
    type: "sedan",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Chevrolet",
    model: "Tahoe",
    pricePerDay: 80,
    type: "suv",
    seats: 7,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Hyundai",
    model: "Elantra",
    pricePerDay: 38,
    type: "sedan",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Mazda",
    model: "CX-5",
    pricePerDay: 50,
    type: "suv",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Volkswagen",
    model: "Jetta",
    pricePerDay: 40,
    type: "sedan",
    seats: 5,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
    ],
  },
  {
    brand: "Porsche",
    model: "911",
    pricePerDay: 200,
    type: "coupe",
    seats: 4,
    fuelType: "petrol",
    available: true,
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
    ],
  },
]

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify admin token
    const { verifyToken } = await import("@/lib/jwt")
    const decoded = verifyToken(token) as any
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    await connectToDatabase()

    // Check if cars already exist
    const existingCars = await Car.countDocuments()
    if (existingCars > 0) {
      return NextResponse.json(
        { message: "Cars already exist. Delete existing cars first or use seed script." },
        { status: 400 }
      )
    }

    // Insert dummy cars
    const insertedCars = await Car.insertMany(dummyCars)

    return NextResponse.json({
      message: `Successfully seeded ${insertedCars.length} cars!`,
      count: insertedCars.length,
    })
  } catch (error: any) {
    console.error("Error seeding cars:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

