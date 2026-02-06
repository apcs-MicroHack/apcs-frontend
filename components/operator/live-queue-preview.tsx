"use client"

import { useState } from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

interface QueueItem {
  id: string
  carrier: string
  truckPlate: string
  timeSlot: string
  operationType: "import" | "export"
  containerRef: string
  waitingTime: string
  priority: "urgent" | "normal"
}

const initialQueue: QueueItem[] = [
  {
    id: "BK-2026-0901",
    carrier: "MedTransport SA",
    truckPlate: "00216-142-AB",
    timeSlot: "08:00 - 09:00",
    operationType: "import",
    containerRef: "MSKU-4829173",
    waitingTime: "45 min",
    priority: "urgent",
  },
  {
    id: "BK-2026-0902",
    carrier: "Algiers Freight Co",
    truckPlate: "00216-231-CD",
    timeSlot: "09:00 - 10:00",
    operationType: "export",
    containerRef: "TCLU-5583920",
    waitingTime: "32 min",
    priority: "urgent",
  },
  {
    id: "BK-2026-0903",
    carrier: "Sahel Logistics",
    truckPlate: "00216-087-EF",
    timeSlot: "09:00 - 10:00",
    operationType: "import",
    containerRef: "CSQU-7721034",
    waitingTime: "18 min",
    priority: "normal",
  },
  {
    id: "BK-2026-0904",
    carrier: "Djurdjura Trans",
    truckPlate: "00216-312-IJ",
    timeSlot: "10:00 - 11:00",
    operationType: "export",
    containerRef: "MAEU-9917543",
    waitingTime: "12 min",
    priority: "normal",
  },
  {
    id: "BK-2026-0905",
    carrier: "Oran Maritime",
    truckPlate: "00216-678-KL",
    timeSlot: "10:00 - 11:00",
    operationType: "import",
    containerRef: "CMAU-6632187",
    waitingTime: "5 min",
    priority: "normal",
  },
]

export function LiveQueuePreview() {
  const [queue, setQueue] = useState(initialQueue)

  const handleApprove = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  const handleReject = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Pending Validations
            </CardTitle>
            <CardDescription>
              {queue.length} booking{queue.length !== 1 ? "s" : ""} awaiting review
            </CardDescription>
          </div>
          <Link href="/operator/queue">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-[hsl(185,60%,42%)]">
              View all
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {queue.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
                item.priority === "urgent"
                  ? "border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/[0.03]"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs font-semibold text-foreground">
                    {item.id}
                  </p>
                  {item.priority === "urgent" && (
                    <Badge className="border-0 bg-[hsl(var(--warning))]/10 px-1.5 py-0 text-[9px] text-[hsl(var(--warning))]">
                      Urgent
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      item.operationType === "import"
                        ? "border-[hsl(210,65%,45%)]/30 px-1.5 py-0 text-[9px] text-[hsl(210,65%,45%)]"
                        : "border-[hsl(185,60%,42%)]/30 px-1.5 py-0 text-[9px] text-[hsl(185,60%,42%)]"
                    }
                  >
                    {item.operationType === "import" ? "IMP" : "EXP"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.carrier} &middot; {item.truckPlate}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.timeSlot}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Waiting: {item.waitingTime}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10 hover:text-[hsl(var(--success))]"
                  onClick={() => handleApprove(item.id)}
                  aria-label="Approve booking"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 hover:text-[hsl(var(--destructive))]"
                  onClick={() => handleReject(item.id)}
                  aria-label="Reject booking"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {queue.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-8 w-8 text-[hsl(var(--success))]/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                All bookings have been reviewed.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
