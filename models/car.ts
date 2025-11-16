import mongoose from "mongoose"

const carSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    type: { type: String, required: true },
    seats: { type: Number, required: true },
    fuelType: { type: String, required: true },
    images: [{ type: String }],
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const Car = mongoose.models.Car || mongoose.model("Car", carSchema)
