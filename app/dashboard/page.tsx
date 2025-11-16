"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Car, Calendar, DollarSign, LogOut, User, Clock, TrendingUp, CheckCircle2, XCircle, FileText, MapPin } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken, decodeToken } from "@/lib/auth-client"

interface Booking {
  _id: string
  carId: {
    brand: string
    model: string
    pricePerDay: number
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a bit for cookie to be available (handles navigation timing)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const token = getAuthToken()

      if (!token) {
        router.push("/auth/login")
        return
      }

      // Decode token first to get user info
      const decoded = decodeToken(token)
      if (decoded) {
        setUser(decoded)
      }

      // Fetch user bookings
      try {
        const res = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        if (!res.ok) {
          // Only redirect if it's a 401 (unauthorized), not other errors
          if (res.status === 401) {
            router.push("/auth/login")
            return
          }
          setError("Failed to load bookings")
          return
        }

        setBookings(data.bookings || [])
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("An error occurred")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, []) // Remove router from dependencies to prevent re-runs

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0"
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const handleCancelBooking = async (bookingId: string) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!token) return

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        setBookings(bookings.filter((b) => b._id !== bookingId))
        toast({
          title: "Booking cancelled",
          description: "Your booking has been successfully cancelled.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel booking. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error cancelling booking:", err)
      toast({
        title: "Error",
        description: "An error occurred while cancelling your booking.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar
        user={user ? { name: user.name, email: user.email, role: user.role } : undefined}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Card */}
        <Card className="mb-8 border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-1">Welcome back, {user?.name || 'User'}! 👋</CardTitle>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/cars">
                  <Button className="gap-2">
                    <Car className="w-4 h-4" />
                    Browse Cars
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{bookings.length}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                {bookings.filter((b) => b.status === "confirmed").length} confirmed
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                ${bookings.reduce((sum, b) => sum + (b.status !== "cancelled" ? b.totalPrice : 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{bookings.filter((b) => b.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{bookings.filter((b) => b.status === "cancelled").length}</div>
              <p className="text-xs text-muted-foreground">Cancelled bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Section */}
        <Card className="border border-border shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your Bookings</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage and track all your car rentals</p>
              </div>
              <Link href="/cars">
                <Button variant="outline" className="gap-2">
                  <Car className="w-4 h-4" />
                  Book New Car
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Car className="w-10 h-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start exploring our fleet of premium vehicles and book your first ride today!
                </p>
                <Link href="/cars">
                  <Button size="lg" className="gap-2">
                    <Car className="w-5 h-5" />
                    Browse Available Cars
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const days = Math.ceil(
                    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                  return (
                    <Card
                      key={booking._id}
                      className="border border-border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Car className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-foreground mb-1">
                                  {booking.carId.brand} {booking.carId.model}
                                </h4>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(booking.startDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}{" "}
                                    →{" "}
                                    {new Date(booking.endDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {days} {days === 1 ? "day" : "days"}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    Booking ID: {booking._id.slice(-8).toUpperCase()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                              <p className="text-2xl font-bold text-foreground">${booking.totalPrice.toLocaleString()}</p>
                              <Badge className={`mt-2 ${getStatusColor(booking.status)}`}>{booking.status}</Badge>
                            </div>
                            {booking.status === "pending" && (
                              <Button
                                type="button"
                                onClick={() => handleCancelBooking(booking._id)}
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                Cancel Booking
                              </Button>
                            )}
                            {booking.status === "confirmed" && (
                              <Link href={`/booking/${booking._id}`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  <FileText className="w-4 h-4" />
                                  View Details
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
