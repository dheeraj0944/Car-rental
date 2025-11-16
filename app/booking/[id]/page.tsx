"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Car, CheckCircle, AlertCircle, Loader, Receipt } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"

interface BookingData {
  _id: string
  carId: {
    brand: string
    model: string
    pricePerDay: number
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: string
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle")
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      // Wait a bit for cookie to be available (handles navigation timing)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
      
      // Use substring to get everything after 'auth_token=' to handle special characters
      const token = cookieValue ? cookieValue.substring('auth_token='.length) : null

      if (!token) {
        router.push("/auth/login")
        return
      }

      // Decode user from token
      try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        )
        const decoded = JSON.parse(jsonPayload)
        setUser(decoded)
      } catch (err) {
        // Invalid token
      }

      try {
        const res = await fetch(`/api/bookings/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        if (res.ok) {
          setBooking(data.booking)
        }
      } catch (err) {
        console.error("Error fetching booking:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [params.id, router])

  const handlePaymentClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirmPayment = async () => {
    setShowConfirmation(false)
    setPaymentProcessing(true)

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1]

      if (!token) {
        router.push("/auth/login")
        return
      }

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Call dummy payment endpoint
      const res = await fetch("/api/payments/dummy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: params.id,
          amount: booking?.totalPrice,
          success: true,
        }),
      })

      if (res.ok) {
        setPaymentStatus("success")

        // Update booking status to confirmed
        const updateRes = await fetch(`/api/bookings/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "confirmed" }),
        })
        // Stay on this page and show confirmation; user can navigate when ready
      } else {
        setPaymentStatus("failed")
      }
    } catch (err) {
      console.error("Error processing payment:", err)
      setPaymentStatus("failed")
    } finally {
      setPaymentProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading booking details...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p className="text-destructive">Booking not found</p>
      </div>
    )
  }

  const subtotal = booking.totalPrice
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const days = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar
        user={user ? { name: user.name, email: user.email, role: user.role } : undefined}
        onLogout={() => {
          document.cookie = "auth_token=; path=/; max-age=0"
          router.push("/")
        }}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border border-border mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-4">
            <div className="flex items-center gap-3">
              {paymentStatus === "success" ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Receipt className="w-6 h-6 text-primary" />
              )}
              <div>
                <h2 className="font-semibold text-foreground">
                  {paymentStatus === "success" ? "Payment Successful!" : "Booking Review & Payment"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {paymentStatus === "success"
                    ? "Your reservation is confirmed"
                    : "Review your booking details and confirm payment"}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-6 pt-6">
            {paymentStatus === "success" && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Payment successful! Your booking is confirmed.</AlertDescription>
              </Alert>
            )}

            {paymentStatus === "failed" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Payment failed. Please try again or contact support.</AlertDescription>
              </Alert>
            )}

            {/* Vehicle Details Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Vehicle Details</h3>
              <Card className="border border-border/50 bg-muted/30">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle</span>
                      <span className="font-semibold text-foreground">
                        {booking.carId.brand} {booking.carId.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Rate</span>
                      <span className="font-semibold text-foreground">${booking.carId.pricePerDay}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental Period</span>
                      <span className="font-semibold text-foreground">{days} day(s)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rental Dates Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Rental Dates</h3>
              <Card className="border border-border/50 bg-muted/30">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(booking.startDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        {new Date(booking.startDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">End Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(booking.endDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        {new Date(booking.endDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Price Breakdown</h3>
              <Card className="border border-primary/20 bg-primary/5">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal ({days} days)</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Taxes & Fees (10%)</span>
                    <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-foreground">Total Amount Due</span>
                    <span className="font-bold text-primary text-lg">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demo Mode Notice */}
            {paymentStatus === "idle" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Demo Mode</p>
                    <p className="text-sm text-blue-800">
                      This is a dummy payment flow. Your payment information is not actually processed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handlePaymentClick}
                disabled={paymentProcessing || paymentStatus === "success"}
                className="w-full py-6 text-base"
                size="lg"
              >
                {paymentProcessing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing Payment...
                  </>
                ) : paymentStatus === "success" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Payment Successful
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Complete Payment
                  </>
                )}
              </Button>

              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>Please review your booking details before confirming the payment</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {booking.carId.brand} {booking.carId.model}
                </span>
                <span className="font-medium">${booking.carId.pricePerDay}/day</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{days} days</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              I understand this is a demo payment and will not be charged to my account.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmPayment} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
