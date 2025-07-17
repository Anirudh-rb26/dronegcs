import { DroneDashboard } from "@/components/drone-dashboard"

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-950 dark:to-gray-800">
      <DroneDashboard />
    </div>
  )
}
