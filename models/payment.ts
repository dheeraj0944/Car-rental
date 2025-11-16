import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed"], required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema)
