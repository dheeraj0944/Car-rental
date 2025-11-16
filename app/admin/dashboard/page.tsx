"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAuthToken, decodeToken } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, DollarSign, LogOut, Trash2, CheckCircle, Shield, Car, Plus, Edit, BarChart3 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  totalUsers: number
  totalCars: number
  totalBookings: number
  totalRevenue: number
}

interface Booking {
  _id: string
  userId: {
    name: string
    email: string
  }
  carId: {
    brand: string
    model: string
  }
  startDate: string
  endDate: string
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled"
}

interface CarData {
  _id: string
  brand: string
  model: string
  pricePerDay: number
  available: boolean
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCars: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [cars, setCars] = useState<CarData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const checkAdminAuth = async () => {
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

      try {
        const decoded = decodeToken(token)
        
        if (!decoded || decoded.role !== "admin") {
          router.push("/dashboard")
          return
        }

        // Fetch bookings and cars
        const [bookingsRes, carsRes] = await Promise.all([
          fetch("/api/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/cars"),
        ])

        const bookingsData = await bookingsRes.json()
        const carsData = await carsRes.json()

        setBookings(bookingsData.bookings || [])
        setCars(carsData.cars || [])

        // Calculate stats
        const confirmedBookings = bookingsData.bookings?.filter((b: Booking) => b.status === "confirmed") || []
        const revenue = confirmedBookings.reduce((sum: number, b: Booking) => sum + b.totalPrice, 0)

        setStats({
          totalUsers: Math.floor(Math.random() * 100) + 50, // Dummy data
          totalCars: carsData.cars?.length || 0,
          totalBookings: bookingsData.bookings?.length || 0,
          totalRevenue: revenue,
        })
      } catch (err) {
        console.error("Error checking auth:", err)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAuth()
  }, []) // Remove router from dependencies

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0"
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const handleApproveBooking = async (bookingId: string) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!token) return

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "confirmed" }),
      })

      if (res.ok) {
        setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: "confirmed" } : b)))
        toast({
          title: "Booking approved",
          description: "The booking has been successfully confirmed.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to approve booking.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error approving booking:", err)
      toast({
        title: "Error",
        description: "An error occurred while approving the booking.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCar = async (carId: string) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!token) return

    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setCars(cars.filter((c) => c._id !== carId))
        toast({
          title: "Car deleted",
          description: "The car has been successfully removed from the fleet.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete car.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting car:", err)
      toast({
        title: "Error",
        description: "An error occurred while deleting the car.",
        variant: "destructive",
      })
    }
  }

  const handleSeedCars = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1]

    if (!token) return

    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Cars seeded!",
          description: `Successfully added ${data.count} cars to the database.`,
        })
        // Refresh cars list
        const carsRes = await fetch("/api/cars")
        const carsData = await carsRes.json()
        setCars(carsData.cars || [])
        setStats((prev) => ({ ...prev, totalCars: carsData.cars?.length || 0 }))
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to seed cars.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error seeding cars:", err)
      toast({
        title: "Error",
        description: "An error occurred while seeding cars.",
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
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar
        user={{ name: "Admin", email: "admin@rentride.com", role: "admin" }}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCars}</div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {booking.carId.brand} {booking.carId.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.userId.name} • ${booking.totalPrice}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {booking.carId.brand} {booking.carId.model}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.userId.name} ({booking.userId.email})
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(booking.startDate).toLocaleDateString()} →{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">${booking.totalPrice}</p>
                            <Badge className={`mt-1 ${getStatusColor(booking.status)}`}>{booking.status}</Badge>
                          </div>
                          {booking.status === "pending" && (
                            <Button
                              type="button"
                              onClick={() => handleApproveBooking(booking._id)}
                              size="sm"
                              className="gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Car Fleet Management</h3>
                <p className="text-sm text-muted-foreground">Manage your vehicle inventory</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={handleSeedCars} variant="outline" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Seed Cars
                </Button>
                <Link href="/admin/cars/new">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Car
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="border border-border">
              <CardContent className="pt-6">
                {cars.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No cars yet</p>
                ) : (
                  <div className="space-y-3">
                    {cars.map((car) => (
                      <div
                        key={car._id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {car.brand} {car.model}
                          </h4>
                          <p className="text-sm text-muted-foreground">${car.pricePerDay}/day</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={car.available ? "default" : "secondary"}>
                            {car.available ? "Available" : "Not Available"}
                          </Badge>
                          <Button
                            type="button"
                            onClick={() => handleDeleteCar(car._id)}
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
