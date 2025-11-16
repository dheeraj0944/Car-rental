"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Car, LogOut, ArrowLeft, CheckCircle, AlertCircle, User, Mail, Shield, Camera, Save, Edit, FileText } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { getAuthToken, decodeToken } from "@/lib/auth-client"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    drivingLicense: "",
  })
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
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

      try {
        const decoded = decodeToken(token)
        if (decoded) {
          setUser(decoded)
          setFormData((prev) => ({ ...prev, name: decoded.name || '' }))
        } else {
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("Error decoding token:", err)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, []) // Remove router from dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLicenseFile(e.target.files[0])
      setFormData((prev) => ({
        ...prev,
        drivingLicense: e.target.files![0].name,
      }))
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = getAuthToken()
      if (!token) {
        router.push("/auth/login")
        return
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          drivingLicense: formData.drivingLicense,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Failed to save profile")
        toast({
          title: "Error",
          description: data.message || "Failed to update profile.",
          variant: "destructive",
        })
        return
      }

      // Update cookie with refreshed token (7 days)
      const expires = new Date()
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
      document.cookie = `auth_token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`

      // Update local state so UI reflects instantly
      setUser((prev) => (prev ? { ...prev, name: data.user.name } : prev))

      setSuccess("Profile updated successfully!")
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to save profile")
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar
        user={user ? { name: user.name, email: user.email, role: user.role } : undefined}
        onLogout={handleLogout}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <Card className="border border-border md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-background shadow-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    {avatarPreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreviewUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-primary" />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setAvatarFile(file)
                        const url = URL.createObjectURL(file)
                        setAvatarPreviewUrl(url)
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 border-2 border-background"
                    onClick={() => avatarInputRef.current?.click()}
                    type="button"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">{user?.name || "User"}</h3>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user?.email}
                  </p>
                  <Badge className="mt-2 capitalize" variant={user?.role === "admin" ? "default" : "secondary"}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role} Account
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="border border-border md:col-span-2 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Profile Settings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Update your personal information</p>
                </div>
                <Edit className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Account Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Account Information
                  </h3>
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <div className="p-3 bg-muted rounded-md border border-border">
                        <p className="text-foreground font-medium">{user?.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Driving License
                  </h3>
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="license">License Image URL</Label>
                      <Input
                        id="license"
                        name="drivingLicense"
                        type="text"
                        value={formData.drivingLicense}
                        onChange={handleInputChange}
                        placeholder="https://example.com/license.jpg"
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a URL to your driving license image. This will be verified by our admin team.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file">Or Upload File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="h-11 cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG. Max size: 5MB</p>
                    </div>

                    {licenseFile && (
                      <div className="p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-foreground">Selected: {licenseFile.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full h-11 gap-2"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
