"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  admin: "Admin",
  carrier: "Carrier",
  operator: "Operator",
  bookings: "Bookings",
  terminals: "Terminals",
  users: "Users",
  carriers: "Carriers",
  reports: "Reports",
  notifications: "Notifications",
  fleet: "Fleet",
  history: "History",
  "create-booking": "Create Booking",
  queue: "Queue",
  capacity: "Capacity",
  chat: "Chat",
}

function formatSegment(segment: string): string {
  return (
    routeLabels[segment] ||
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}

export function AutoBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/${segments[0]}`} className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1
          const label = formatSegment(segment)

          return (
            <BreadcrumbItem key={segment}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={href}>{label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
