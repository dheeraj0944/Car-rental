import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import { verifyToken, generateToken } from "@/lib/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token) as any
    if (!decoded) return NextResponse.json({ message: "Invalid token" }, { status: 401 })

    await connectToDatabase()
    const user = await User.findById(decoded.id).select("name email role drivingLicense")
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 })

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        drivingLicense: user.drivingLicense || "",
      },
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const decoded = verifyToken(token) as any
    if (!decoded) return NextResponse.json({ message: "Invalid token" }, { status: 401 })

    const body = await request.json()
    const { name, drivingLicense } = body || {}

    await connectToDatabase()
    const user = await User.findById(decoded.id)
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 })

    if (typeof name === "string" && name.trim()) user.name = name.trim()
    if (typeof drivingLicense === "string") user.drivingLicense = drivingLicense
    await user.save()

    // Issue a fresh token so UI shows updated name everywhere
    const newToken = generateToken({ id: user._id, email: user.email, role: user.role, name: user.name })

    return NextResponse.json({
      message: "Profile updated",
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        drivingLicense: user.drivingLicense || "",
      },
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}


