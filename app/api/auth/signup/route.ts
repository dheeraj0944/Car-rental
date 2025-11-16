import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { generateToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    })

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json(
      {
        message: "Account created successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
