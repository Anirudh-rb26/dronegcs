const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const cors = require("cors")

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const PORT = 8080

// In-memory drone state
const droneState = {
  battery: 100,
  latitude: 18.5914,
  longitude: 73.7381,
  altitude: 41,
  status: "idle", // Initial status
}

app.use(cors()) // Enable CORS for all routes
app.use(express.json()) // For parsing application/json

// POST /start-mission endpoint
app.post("/start-mission", (req, res) => {
  console.log("Received start-mission command")
  droneState.status = "in_mission"
  // Optionally reset other telemetry for a new mission start
  droneState.battery = 100
  droneState.altitude = 41
  droneState.latitude = 18.5914
  droneState.longitude = 73.7381
  // Send immediate update to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(droneState))
    }
  })
  res.status(200).json({ message: "Mission started", status: droneState.status })
})

// GET /status endpoint (not directly used by frontend, but available)
app.get("/status", (req, res) => {
  res.status(200).json(droneState)
})

// WebSocket server
wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket")
  // Send initial state to new client
  ws.send(JSON.stringify(droneState))

  // Simulate telemetry updates every 2 seconds
  const interval = setInterval(() => {
    if (droneState.status === "in_mission") {
      droneState.battery = Math.max(0, droneState.battery - Math.random() * 0.5) // Battery drains
      droneState.latitude += (Math.random() - 0.5) * 0.0001
      droneState.longitude += (Math.random() - 0.5) * 0.0001
      droneState.altitude = Math.max(0, droneState.altitude + (Math.random() - 0.5) * 0.5)

      if (droneState.battery <= 25 && droneState.status !== "returning_home") {
        droneState.status = "returning_home" // Low battery, returning home
      }
      if (droneState.battery <= 0) {
        droneState.battery = 0
        droneState.status = "landed" // Mission completed due to battery
        clearInterval(interval) // Stop sending updates
      }
    } else if (droneState.status === "returning_home") {
      droneState.battery = Math.max(0, droneState.battery - Math.random() * 0.2) // Slower drain
      droneState.altitude = Math.max(0, droneState.altitude - Math.random() * 0.5) // Descending
      // Simulate moving back towards origin (simplified)
      droneState.latitude -= (droneState.latitude - 18.5914) * 0.01
      droneState.longitude -= (droneState.longitude - 73.7381) * 0.01

      if (droneState.altitude <= 1 && droneState.battery > 0) {
        droneState.altitude = 0
        droneState.status = "landed"
        clearInterval(interval)
      } else if (droneState.battery <= 0) {
        droneState.battery = 0
        droneState.status = "landed"
        clearInterval(interval)
      }
    } else if (droneState.status === "landed") {
      // No updates if landed
      clearInterval(interval)
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(droneState))
    }
  }, 2000)

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket")
    clearInterval(interval) // Clear interval when client disconnects
  })

  ws.on("error", (error) => {
    console.error("WebSocket error:", error)
    clearInterval(interval)
  })
})

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
  console.log(`WebSocket server running on ws://localhost:${PORT}`)
})
