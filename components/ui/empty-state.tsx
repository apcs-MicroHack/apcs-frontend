import { cn } from "@/lib/utils"
import { 
  Inbox, 
  Search, 
  FileX, 
  Calendar, 
  Truck, 
  Bell, 
  BarChart3,
  ClipboardList,
  Ship,
  type LucideIcon 
} from "lucide-react"
import { Button } from "./button"

type EmptyStateType = 
  | "no-data" 
  | "no-results" 
  | "no-bookings" 
  | "no-trucks" 
  | "no-notifications" 
  | "no-reports"
  | "no-carriers"
  | "error"

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const emptyStateConfig: Record<EmptyStateType, { icon: LucideIcon; title: string; description: string }> = {
  "no-data": {
    icon: Inbox,
    title: "No data available",
    description: "There's nothing to display here yet.",
  },
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
  "no-bookings": {
    icon: ClipboardList,
    title: "No bookings yet",
    description: "Create your first booking to get started.",
  },
  "no-trucks": {
    icon: Truck,
    title: "No trucks in fleet",
    description: "Add trucks to your fleet to start booking.",
  },
  "no-notifications": {
    icon: Bell,
    title: "All caught up!",
    description: "You have no new notifications.",
  },
  "no-reports": {
    icon: BarChart3,
    title: "No report data",
    description: "Data will appear here once bookings are made.",
  },
  "no-carriers": {
    icon: Ship,
    title: "No carriers found",
    description: "No carrier accounts have been created yet.",
  },
  "error": {
    icon: FileX,
    title: "Something went wrong",
    description: "We couldn't load the data. Please try again.",
  },
}

export function EmptyState({
  type = "no-data",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="relative mb-4">
        {/* Background decoration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-muted/50" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-muted" />
        </div>
        {/* Icon */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
      
      <h3 className="mb-1 text-lg font-semibold text-foreground">
        {title || config.title}
      </h3>
      <p className="mb-4 max-w-[280px] text-sm text-muted-foreground">
        {description || config.description}
      </p>
      
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}
