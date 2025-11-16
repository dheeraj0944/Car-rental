"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, AlertCircle, Lock, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Login failed")
        return
      }

      // Check if user is admin
      if (data.role !== "admin") {
        setError("Access denied. Admin credentials required.")
        setLoading(false) // Make sure to set loading to false
        toast({
          title: "Access Denied",
          description: "You need administrator privileges to access this page.",
          variant: "destructive",
        })
        return
      }

      // Set auth token cookie with proper settings - use expires instead of max-age for better compatibility
      const expires = new Date()
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      document.cookie = `auth_token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`

      toast({
        title: "Welcome Admin!",
        description: "You have been successfully logged in.",
      })

      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } catch (err) {
      setError("An error occurred during login")
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">RentRide Management System</p>
          </div>
        </div>

        <Card className="border border-border shadow-lg">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Admin Login
            </CardTitle>
            <CardDescription>Enter your administrator credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@rentride.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <Link href="/" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Not an admin?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              User Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

