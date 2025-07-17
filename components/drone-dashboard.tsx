"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BatteryCharging, MapPin, Mountain, Play, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming cn utility is available

interface DroneTelemetry {
  battery: number
  latitude: number
  longitude: number
  altitude: number
  status: string
}

export function DroneDashboard() {
  const [droneData, setDroneData] = useState<DroneTelemetry>({
    battery: 100,
    latitude: 18.5914,
    longitude: 73.7381,
    altitude: 41,
    status: "idle",
  })
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080")

    ws.onopen = () => {
      console.log("WebSocket connected")
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      const data: DroneTelemetry = JSON.parse(event.data as string)
      setDroneData(data)
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setWsConnected(false)
      // In a production app, you'd implement a robust reconnect strategy here.
      // For this example, we simply log and indicate disconnection.
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      ws.close()
    }

    return () => {
      ws.close()
    }
  }, [])

  const handleStartMission = async () => {
    try {
      // Use a Next.js Route Handler as a Backend for Frontend (BFF) [^1]
      const response = await fetch("/api/start-mission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: "start" }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Mission command sent:", result)
      // The WebSocket will update the state, so no need to set it here directly
    } catch (error) {
      console.error("Failed to send start mission command:", error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "in_mission":
        return "bg-green-500 text-white"
      case "idle":
        return "bg-gray-400 text-white"
      case "returning_home":
        return "bg-orange-500 text-white"
      case "landed":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const isBatteryLow = droneData.battery < 25 && droneData.battery > 0

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Drone GCS Dashboard</CardTitle>
          <CardDescription>Real-time telemetry and mission control</CardDescription>
        </div>
        <Badge className={cn("px-3 py-1 text-sm font-semibold", getStatusBadgeColor(droneData.status))}>
          {droneData.status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <BatteryCharging
              className={cn(
                "h-6 w-6",
                isBatteryLow ? "text-red-500 animate-pulse" : "text-gray-500 dark:text-gray-400",
              )}
            />
            <div className={cn("text-xl font-semibold", isBatteryLow && "text-red-500")}>
              Battery: {droneData.battery.toFixed(1)}%
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mountain className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div className="text-xl font-semibold">Altitude: {droneData.altitude.toFixed(1)}m</div>
          </div>
          <div className="flex items-center gap-3 col-span-full">
            <MapPin className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div className="text-xl font-semibold">
              GPS: {droneData.latitude.toFixed(4)}, {droneData.longitude.toFixed(4)}
            </div>
          </div>
        </div>

        {isBatteryLow && (
          <div className="flex items-center gap-2 text-red-500 font-medium bg-red-50 border border-red-200 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5" />
            <span>Low Battery! Returning to base.</span>
          </div>
        )}

        {!wsConnected && (
          <p className="text-center text-sm text-red-500">
            WebSocket disconnected. Please ensure the backend server is running.
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          onClick={handleStartMission}
          disabled={droneData.status === "in_mission" || !wsConnected}
          className="w-full"
        >
          <Play className="mr-2 h-4 w-4" />
          Start Mission
        </Button>
      </CardFooter>
    </Card>
  )
}
