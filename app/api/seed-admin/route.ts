import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@rentride.com" })
    if (existingAdmin) {
      return NextResponse.json(
        {
          message: "Admin user already exists",
          email: "admin@rentride.com",
          password: "admin123",
        },
        { status: 200 }
      )
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@rentride.com",
      password: "admin123", // This will be hashed automatically
      role: "admin",
    })

    return NextResponse.json(
      {
        message: "Admin user created successfully!",
        email: "admin@rentride.com",
        password: "admin123",
        userId: admin._id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error seeding admin:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

