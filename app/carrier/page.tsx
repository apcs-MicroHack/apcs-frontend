import { CarrierKpiCards } from "@/components/carrier/carrier-kpi-cards"
import { CarrierRecentBookings } from "@/components/carrier/carrier-recent-bookings"
import { CarrierQuickActions } from "@/components/carrier/carrier-quick-actions"
import { CarrierBookingChart } from "@/components/carrier/carrier-booking-chart"

export default function CarrierDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <CarrierKpiCards />

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CarrierBookingChart />
        </div>
        <CarrierQuickActions />
      </div>

      {/* Recent Bookings */}
      <CarrierRecentBookings />
    </div>
  )
}
