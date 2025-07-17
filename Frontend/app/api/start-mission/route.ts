import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const backendUrl = "http://localhost:8080/start-mission" // URL of your Express backend

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command: "start" }), // Send a simple command
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend responded with status ${response.status}: ${errorText}`)
      return new NextResponse(`Backend error: ${errorText}`, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying start mission command:", error)
    const message = error instanceof Error ? error.message : "An unknown error occurred"
    return new NextResponse(message, { status: 500 })
  }
}
