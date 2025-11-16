"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Car, MapPin, Calendar, DollarSign, Shield, Star, Users, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react"
import { getAuthToken, decodeToken } from "@/lib/auth-client"

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

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

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; max-age=0"
    setUser(null)
    router.push("/")
  }
  const stats = [
    { value: "10,000+", label: "Happy Customers", icon: Users },
    { value: "500+", label: "Fleet Vehicles", icon: Car },
    { value: "4.8/5", label: "Average Rating", icon: Star },
    { value: "99%", label: "Satisfaction Rate", icon: TrendingUp },
  ]

  const features = [
    {
      icon: Calendar,
      title: "Flexible Booking",
      description: "Book a car the same day or months in advance. Cancel or modify your reservation anytime.",
    },
    {
      icon: DollarSign,
      title: "Best Prices",
      description: "Compare and find the most competitive rates. No hidden fees, transparent pricing.",
    },
    {
      icon: Car,
      title: "Quality Vehicles",
      description: "Well-maintained cars for a comfortable ride. Regular inspections and top-notch service.",
    },
    {
      icon: Shield,
      title: "24/7 Support",
      description: "Round-the-clock customer support. We're here to help whenever you need us.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frequent Traveler",
      content: "RentRide made my road trip amazing! The booking process was seamless and the car was perfect.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Business Professional",
      content: "I've used RentRide for all my business trips. Reliable, clean cars, and great customer service.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Family Traveler",
      content: "Perfect for our family vacation! Spacious car, great price, and the kids loved it. Highly recommend!",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <Navbar
        user={user ? { name: user.name, email: user.email, role: user.role } : undefined}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4">
              <Star className="w-4 h-4 fill-primary" />
              <span>Trusted by 10,000+ customers</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight animate-in fade-in slide-in-from-bottom-6">
              Your Journey
              <br />
              <span className="text-primary">Starts Here</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8">
              Rent premium cars for your next adventure. Simple, affordable, and reliable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10">
              <Link href="/cars">
                <Button size="lg" className="gap-2 text-lg px-8 h-12">
                  <MapPin className="w-5 h-5" />
                  Browse Cars
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border border-border hover:border-primary/50 transition-colors text-center">
              <CardContent className="pt-6">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose RentRide?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a perfect car rental experience
            </p>
          </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-border hover:shadow-lg hover:border-primary/50 transition-all group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">Don't just take our word for it</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base">{testimonial.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="border border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-12 pb-12 px-8">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-foreground">Ready to Hit the Road?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied customers and start your journey today
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/cars">
                  <Button size="lg" className="gap-2 text-lg px-8 h-12">
                    Browse Available Cars
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
              <Car className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl text-foreground">RentRide</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted car rental platform. Simple, affordable, and reliable.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/cars" className="text-muted-foreground hover:text-foreground transition-colors">
                    Browse Cars
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Admin</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/admin-login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 RentRide. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

