import { KpiCards } from "@/components/admin/kpi-cards"
import { BookingsChart } from "@/components/admin/bookings-chart"
import { CapacityOverview } from "@/components/admin/capacity-overview"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { QuickActions } from "@/components/admin/quick-actions"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <KpiCards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BookingsChart />
        </div>
        <div className="flex flex-col gap-6">
          <QuickActions />
        </div>
      </div>

      {/* Capacity + Recent Bookings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookings />
        </div>
        <CapacityOverview />
      </div>
    </div>
  )
}
