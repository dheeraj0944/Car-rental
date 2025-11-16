"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import CarCard from "@/components/car-card"
import { Navbar } from "@/components/navbar"
import { Spinner } from "@/components/ui/spinner"
import { Car, Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { getAuthToken, decodeToken } from "@/lib/auth-client"
import Link from "next/link"

interface FilterState {
  brand: string
  fuelType: string
  minPrice: string
  maxPrice: string
  seats: string
  search: string
}

export default function CarsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    brand: "",
    fuelType: "",
    minPrice: "",
    maxPrice: "",
    seats: "",
    search: "",
  })

  // Check if user is logged in (optional - cars page is public)
  useEffect(() => {
    const checkUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      const token = getAuthToken()
      if (token) {
        const decoded = decodeToken(token)
        if (decoded) {
          setUser(decoded)
        }
      }
    }
    checkUser()
  }, [])

  const fetchCars = async (activeFilters: FilterState) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (activeFilters.brand) params.append("brand", activeFilters.brand)
      if (activeFilters.fuelType && activeFilters.fuelType !== "all") params.append("fuelType", activeFilters.fuelType)
      if (activeFilters.minPrice) params.append("minPrice", activeFilters.minPrice)
      if (activeFilters.maxPrice) params.append("maxPrice", activeFilters.maxPrice)
      if (activeFilters.seats && activeFilters.seats !== "any") params.append("seats", activeFilters.seats)

      const res = await fetch(`/api/cars?${params.toString()}`)
      const data = await res.json()
      let filteredCars = data.cars || []
      
      // Client-side search filter
      if (activeFilters.search) {
        const searchLower = activeFilters.search.toLowerCase()
        filteredCars = filteredCars.filter(
          (car: any) =>
            car.brand.toLowerCase().includes(searchLower) ||
            car.model.toLowerCase().includes(searchLower) ||
            `${car.brand} ${car.model}`.toLowerCase().includes(searchLower)
        )
      }
      
      setCars(filteredCars)
    } catch (error) {
      console.error("Error fetching cars:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars(filters)
  }, [])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    fetchCars(filters)
  }

  const resetFilters = () => {
    const emptyFilters = {
      brand: "",
      fuelType: "",
      minPrice: "",
      maxPrice: "",
      seats: "",
      search: "",
    }
    setFilters(emptyFilters)
    fetchCars(emptyFilters)
  }

  const activeFiltersCount = Object.values(filters).filter((v) => v && v !== "all" && v !== "any").length

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0"
    setUser(null)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar
        user={user ? { name: user.name, email: user.email, role: user.role } : undefined}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Our Fleet</h1>
          <p className="text-muted-foreground">Find the perfect car for your next adventure</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search by brand or model..."
            value={filters.search}
            onChange={(e) => {
              handleFilterChange("search", e.target.value)
              const newFilters = { ...filters, search: e.target.value }
              fetchCars(newFilters)
            }}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`md:col-span-1 ${showFilters ? "block" : "hidden md:block"}`}>
            <Card className="border border-border sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="h-8 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Toyota"
                    value={filters.brand}
                    onChange={(e) => handleFilterChange("brand", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange("fuelType", value)}>
                    <SelectTrigger id="fuelType">
                      <SelectValue placeholder="All fuel types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Min Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="$0"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Max Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="$500"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Min Seats</Label>
                  <Select value={filters.seats} onValueChange={(value) => handleFilterChange("seats", value)}>
                    <SelectTrigger id="seats">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="2">2+ Seats</SelectItem>
                      <SelectItem value="4">4+ Seats</SelectItem>
                      <SelectItem value="5">5+ Seats</SelectItem>
                      <SelectItem value="7">7+ Seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" onClick={applyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cars Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border border-border animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                      <div className="h-8 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Car className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No cars found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button type="button" onClick={resetFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{cars.length}</span>{" "}
                    {cars.length === 1 ? "car" : "cars"}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cars.map((car) => (
                    <CarCard
                      key={car._id}
                      id={car._id}
                      brand={car.brand}
                      model={car.model}
                      pricePerDay={car.pricePerDay}
                      seats={car.seats}
                      fuelType={car.fuelType}
                      images={car.images}
                      available={car.available}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
