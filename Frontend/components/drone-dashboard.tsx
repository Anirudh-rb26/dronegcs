"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BatteryCharging, MapPin, Mountain, Play, AlertTriangle, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils" // Assuming cn utility is available
import { MapDisplay } from "./map-display" // Import the new MapDisplay component

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
    <Card className="w-full rounded-xl shadow-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 flex flex-col lg:flex-row">
      <CardHeader className="flex flex-col items-start p-8 lg:w-1/3 lg:border-r lg:border-gray-200 dark:lg:border-gray-700">
        <div className="flex items-center justify-between w-full mb-4">
          <CardTitle className="text-4xl font-extrabold tracking-tight">Drone GCS</CardTitle>
          <Badge
            className={cn(
              "px-4 py-2 text-base font-bold rounded-full shadow-md",
              getStatusBadgeColor(droneData.status),
            )}
          >
            {droneData.status.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Real-time telemetry and mission control for your drone.
        </CardDescription>

        <div className="grid grid-cols-1 gap-6 w-full">
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <BatteryCharging
              className={cn(
                "h-10 w-10 transition-colors duration-300",
                isBatteryLow ? "text-red-500 animate-pulse" : "text-green-500",
              )}
            />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">Battery</span>
              <span className={cn("text-3xl font-bold", isBatteryLow && "text-red-500")}>
                {droneData.battery.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <Mountain className="h-10 w-10 text-blue-500" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">Altitude</span>
              <span className="text-3xl font-bold">{droneData.altitude.toFixed(1)}m</span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <MapPin className="h-10 w-10 text-purple-500" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">GPS Coordinates</span>
              <span className="text-2xl font-bold">
                {droneData.latitude.toFixed(4)}, {droneData.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        <CardFooter className="p-0 pt-6 w-full">
          <Button
            onClick={handleStartMission}
            disabled={droneData.status === "in_mission" || !wsConnected}
            className="w-full py-4 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="mr-3 h-6 w-6" />
            Start Mission
          </Button>
        </CardFooter>
      </CardHeader>

      <CardContent className="flex-1 p-8 flex flex-col gap-6">
        {isBatteryLow && (
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 p-4 rounded-lg shadow-md animate-fade-in">
            <AlertTriangle className="h-7 w-7 flex-shrink-0" />
            <span className="text-lg">Low Battery! Drone is returning to base.</span>
          </div>
        )}

        {!wsConnected && (
          <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-700 p-4 rounded-lg shadow-md">
            <WifiOff className="h-7 w-7 flex-shrink-0" />
            <span className="text-lg">WebSocket disconnected. Please ensure the backend server is running.</span>
          </div>
        )}

        <MapDisplay latitude={droneData.latitude} longitude={droneData.longitude} />
      </CardContent>
    </Card>
  )
}
