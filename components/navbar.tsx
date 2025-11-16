"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, Moon, Sun, Menu, X, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  user?: {
    name?: string
    email?: string
    role?: string
  }
  onLogout?: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 supports-[backdrop-filter]:bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Car className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-foreground">RentRide</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/cars">Browse Cars</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                {onLogout && (
                  <Button type="button" onClick={onLogout} variant="outline">
                    Logout
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/cars">Browse Cars</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                  <Link href="/auth/admin-login">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                </Button>
              </>
            )}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border pt-4">
            {user ? (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/cars" onClick={() => setMobileMenuOpen(false)}>
                    Browse Cars
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                </Button>
                {onLogout && (
                  <Button
                    type="button"
                    onClick={() => {
                      onLogout()
                      setMobileMenuOpen(false)
                    }}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Logout
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/cars" onClick={() => setMobileMenuOpen(false)}>
                    Browse Cars
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/auth/admin-login" onClick={() => setMobileMenuOpen(false)}>
                    <Shield className="w-4 h-4" />
                    Admin Login
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

