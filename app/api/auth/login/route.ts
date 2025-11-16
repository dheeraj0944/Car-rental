import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { generateToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is blocked
    if (user.blocked) {
      return NextResponse.json({ message: "Your account has been blocked" }, { status: 403 })
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
