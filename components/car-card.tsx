import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Fuel, AlertCircle, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CarCardProps {
  id: string
  brand: string
  model: string
  pricePerDay: number
  seats: number
  fuelType: string
  images: string[]
  available: boolean
}

export default function CarCard({ id, brand, model, pricePerDay, seats, fuelType, images, available }: CarCardProps) {
  const imageUrl = images?.[0] || "/rental-car.png"
  const rating = 4.5 + Math.random() * 0.5 // Simulated rating

  return (
    <Card className="group overflow-hidden border border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video relative bg-muted overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={`${brand} ${model}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-white font-medium">{rating.toFixed(1)}</span>
        </div>
        {!available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-white text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-2" />
              <p className="font-semibold text-lg">Not Available</p>
            </div>
          </div>
        )}
        {available && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <Link href={`/cars/${id}`}>
                <Button size="sm" className="w-full">
                  Quick View
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
              {brand} {model}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="capitalize">{fuelType}</span>
              <span>•</span>
              <span>{seats} Seats</span>
            </div>
          </div>
          {available && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              Available
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-baseline justify-between pt-4 border-t border-border">
          <div>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-foreground">${pricePerDay}</p>
              <p className="text-sm text-muted-foreground ml-1">/day</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Best price guaranteed</p>
          </div>
          <Link href={`/cars/${id}`}>
            <Button disabled={!available} className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
              View Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

