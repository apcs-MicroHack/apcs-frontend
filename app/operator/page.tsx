import { OperatorKpiCards } from "@/components/operator/operator-kpi-cards"
import { LiveQueuePreview } from "@/components/operator/live-queue-preview"
import { CapacityMonitor } from "@/components/operator/capacity-monitor"
import { HourlyActivityChart } from "@/components/operator/hourly-activity-chart"
import { OperatorQuickActions } from "@/components/operator/operator-quick-actions"

export default function OperatorDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <OperatorKpiCards />

      {/* Main Content Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveQueuePreview />
        </div>
        <OperatorQuickActions />
      </div>

      {/* Charts + Capacity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HourlyActivityChart />
        </div>
        <CapacityMonitor />
      </div>
    </div>
  )
}
