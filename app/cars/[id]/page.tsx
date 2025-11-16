"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { Car, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [booking, setBooking] = useState({
    startDate: "",
    endDate: "",
  })
  const [calculating, setCalculating] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)
  const [days, setDays] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (token) {
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
    }
  }, [])

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/cars/${params.id}`)
        const data = await res.json()
        setCar(data.car)
      } catch (err) {
        setError("Failed to load car details")
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [params.id])

  const handleDateChange = (field: string, value: string) => {
    const newBooking = { ...booking, [field]: value }
    setBooking(newBooking)

    // Calculate total price
    if (newBooking.startDate && newBooking.endDate) {
      const start = new Date(newBooking.startDate)
      const end = new Date(newBooking.endDate)
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      setDays(diffDays > 0 ? diffDays : 0)
      if (diffDays > 0) {
        setTotalPrice(car.pricePerDay * diffDays)
      } else {
        setTotalPrice(0)
      }
    }
  }

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0"
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const handleBooking = async () => {
    if (!booking.startDate || !booking.endDate) {
      setError("Please select both start and end dates")
      return
    }

    setCalculating(true)
    setError("")

    try {
      // Wait a bit for cookie to be available (handles navigation timing)
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
      
      // Use substring to get everything after 'auth_token=' to handle special characters
      const token = cookieValue ? cookieValue.substring('auth_token='.length) : null

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please login to book a car.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: params.id,
          startDate: booking.startDate,
          endDate: booking.endDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Booking failed")
        toast({
          title: "Booking failed",
          description: data.message || "Please try different dates.",
          variant: "destructive",
        })
        return
      }

      setSuccess("Booking created! Proceeding to payment...")
      router.push(`/booking/${data.booking._id}`)
    } catch (err) {
      setError("An error occurred during booking")
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading car details...</p>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p className="text-destructive">Car not found</p>
      </div>
    )
  }

  const imageUrl = car.images?.[0] || "/placeholder.svg?key=cardetail"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar
        user={user ? { name: user.name, email: user.email, role: user.role } : undefined}
        onLogout={handleLogout}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/cars">
          <Button variant="ghost" className="mb-6">
            ← Back to Cars
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Car Image and Details */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden border border-border">
              <div className="aspect-video relative bg-muted mb-6">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-cover"
                />
              </div>

              <CardHeader>
                <CardTitle className="text-3xl">
                  {car.brand} {car.model}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="text-lg font-semibold">{car.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="text-lg font-semibold">{car.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="text-lg font-semibold">{car.seats} Seats</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price Per Day</p>
                    <p className="text-lg font-semibold text-primary">${car.pricePerDay}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold mb-2">Availability</h3>
                  {car.available ? (
                    <p className="text-sm text-green-600 font-medium">Available for booking</p>
                  ) : (
                    <p className="text-sm text-destructive font-medium">Currently unavailable</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="border border-border sticky top-24">
              <CardHeader>
                <CardTitle>Book This Car</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 text-green-900 border-green-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={booking.startDate}
                    onChange={(e) => handleDateChange("startDate", e.target.value)}
                    disabled={!car.available}
                    min={new Date().toISOString().slice(0,16)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={booking.endDate}
                    onChange={(e) => handleDateChange("endDate", e.target.value)}
                    disabled={!car.available}
                    min={booking.startDate || new Date().toISOString().slice(0,16)}
                  />
                </div>

                {days > 0 && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days</span>
                      <span className="font-medium">{days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate per day</span>
                      <span className="font-medium">${car.pricePerDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">${totalPrice}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tax and fees calculated at checkout</p>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleBooking}
                  disabled={!car.available || calculating || days <= 0}
                  className="w-full mt-6"
                >
                  {calculating ? "Booking..." : days > 0 ? "Continue to Payment" : "Select valid dates"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
