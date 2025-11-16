"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, AlertCircle, CheckCircle, Shield } from "lucide-react"

export default function NewCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    pricePerDay: "",
    type: "sedan",
    seats: "4",
    fuelType: "petrol",
    images: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Wait a bit for cookie to be available (handles navigation timing)
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
      
      const token = cookieValue ? cookieValue.substring('auth_token='.length) : null

      if (!token) {
        router.push("/auth/login")
        return
      }

      const res = await fetch("/api/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pricePerDay: Number.parseInt(formData.pricePerDay),
          seats: Number.parseInt(formData.seats),
          images: formData.images
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to add car")
        return
      }

      setSuccess("Car added successfully!")
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 1000)
    } catch (err) {
      setError("An error occurred while adding the car")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-foreground">RentRide Admin</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin/dashboard">
          <Button variant="ghost" className="mb-6">
            ← Back to Dashboard
          </Button>
        </Link>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Car</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    name="brand"
                    placeholder="e.g., Toyota"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="e.g., Camry"
                    value={formData.model}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Price Per Day ($) *</Label>
                  <Input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    placeholder="50"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Number of Seats *</Label>
                  <Select value={formData.seats} onValueChange={(value) => handleSelectChange("seats", value)}>
                    <SelectTrigger id="seats">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Seats</SelectItem>
                      <SelectItem value="4">4 Seats</SelectItem>
                      <SelectItem value="5">5 Seats</SelectItem>
                      <SelectItem value="7">7 Seats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Vehicle Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type *</Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleSelectChange("fuelType", value)}>
                    <SelectTrigger id="fuelType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Image URLs</Label>
                <Input
                  id="images"
                  name="images"
                  placeholder="https://example.com/car1.jpg, https://example.com/car2.jpg"
                  value={formData.images}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Separate multiple image URLs with commas</p>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Adding Car..." : "Add Car"}
                </Button>
                <Link href="/admin/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
