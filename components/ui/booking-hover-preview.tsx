"use client"

import { Badge } from "./badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Calendar, Clock, Container, Truck, MapPin } from "lucide-react"

interface BookingPreviewData {
  id: string
  reference: string
  status: string
  date: string
  time: string
  terminal: string
  truckPlate?: string
  cargoType?: string
  carrierName?: string
}

interface BookingHoverPreviewProps {
  booking: BookingPreviewData
  children: React.ReactNode
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-500/10", text: "text-amber-500" },
  CONFIRMED: { bg: "bg-blue-500/10", text: "text-blue-500" },
  CONSUMED: { bg: "bg-green-500/10", text: "text-green-500" },
  REJECTED: { bg: "bg-red-500/10", text: "text-red-500" },
  CANCELLED: { bg: "bg-gray-500/10", text: "text-gray-500" },
  EXPIRED: { bg: "bg-orange-500/10", text: "text-orange-500" },
}

export function BookingHoverPreview({
  booking,
  children,
}: BookingHoverPreviewProps) {
  const statusStyle = statusColors[booking.status] || statusColors.PENDING

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72" align="start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-medium">
              {booking.reference}
            </span>
            <Badge className={`${statusStyle.bg} ${statusStyle.text} border-0`}>
              {booking.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{booking.terminal}</span>
            </div>
            {booking.truckPlate && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="h-3.5 w-3.5" />
                <span>{booking.truckPlate}</span>
              </div>
            )}
          </div>

          {(booking.cargoType || booking.carrierName) && (
            <div className="border-t border-border pt-2">
              {booking.cargoType && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Container className="h-3.5 w-3.5" />
                  <span>{booking.cargoType}</span>
                </div>
              )}
              {booking.carrierName && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Carrier: {booking.carrierName}
                </p>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
