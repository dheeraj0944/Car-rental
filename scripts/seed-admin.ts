import { connectToDatabase } from "../lib/mongodb"
import { User } from "../models/user"

async function seedAdmin() {
  try {
    await connectToDatabase()

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@rentride.com" })
    if (existingAdmin) {
      console.log("Admin user already exists!")
      console.log("Email: admin@rentride.com")
      console.log("Password: admin123")
      return
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@rentride.com",
      password: "admin123", // This will be hashed automatically
      role: "admin",
    })

    console.log("✅ Admin user created successfully!")
    console.log("Email: admin@rentride.com")
    console.log("Password: admin123")
    console.log("User ID:", admin._id)
  } catch (error: any) {
    console.error("Error seeding admin:", error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log("Done!")
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedAdmin }

