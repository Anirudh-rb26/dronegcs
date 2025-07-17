# DroneGCS (Ground Control Station)

A web-based ground control station for managing and monitoring drones.

## Tech Stack

- **Frontend:**

  - Next.js 13
  - TypeScript
  - Tailwind CSS
  - WebSocket Client

- **Backend:**
  - Node.js
  - WebSocket Server
  - MongoDB

## Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/yourusername/dronegcs.git
cd dronegcs
```

2. Install dependencies (for both Frontend and Backend Folder)

```bash
npm install
```

3. Start the WebSocket server (in a separate terminal)

```bash
node server.js
```

5. Run the Next.js development server (in another terminal)

```bash
npm run dev
```

6. Access the application:

- Frontend: http://localhost:3000

## API Contract

### WebSocket Events

1. Drone Connection

```typescript
// Connect drone
emit("drone:connect", { droneId: string });

// Drone connected response
on("drone:connected", {
  droneId: string,
  status: "connected" | "error",
});
```

2. Telemetry Data

```typescript
// Receive telemetry
on("telemetry:update", {
  droneId: string,
  position: {
    latitude: number,
    longitude: number,
    altitude: number,
  },
  battery: number,
  speed: number,
});
```

3. Command Control

```typescript
// Send command
emit("drone:command", {
  droneId: string,
  command: "takeoff" | "land" | "return" | "move",
  params: {
    altitude: number,
    speed: number,
  },
});
```

## Architecture Diagrams

### Data Flow Diagram

```mermaid
graph TB
    U[User Interface] -->|Start Mission| N[Next.js API Route]
    N -->|POST /start-mission| E[Express Server]
    E -->|Update State| W[WebSocket Server]
    W -->|Telemetry Updates| C[WebSocket Client]
    C -->|State Updates| R[React Components]
    R -->|Render| U

    subgraph Backend
        E
        W
        DS[Drone State]
        W -->|Update| DS
        DS -->|Read| W
    end

    subgraph Frontend
        U
        N
        C
        R
    end
```

### Component Architecture

```mermaid
graph TB
    HP[HomePage] -->|Renders| DD[DroneDashboard]
    DD -->|Renders| MD[MapDisplay]
    DD -->|Renders| TW[Telemetry Widgets]
    DD -->|Renders| CB[Control Buttons]

    subgraph Components
        DD
        MD -->|Uses| LM[Leaflet Map]
        TW -->|Displays| B[Battery]
        TW -->|Displays| A[Altitude]
        TW -->|Displays| G[GPS]
        CB -->|Controls| SM[Start Mission]
    end

    subgraph State Management
        WS[WebSocket Connection]
        DS[Drone State]
        WS -->|Updates| DS
        DS -->|Triggers| DD
    end
```

### State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> InMission: Start Mission
    InMission --> ReturningHome: Battery <= 25%
    InMission --> Landed: Mission Complete
    ReturningHome --> Landed: Altitude <= 1m
    ReturningHome --> Landed: Battery <= 0
    Landed --> Idle: Reset
```

### Sequence Diagram (Mission Start)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant N as Next.js API
    participant E as Express Server
    participant W as WebSocket

    U->>F: Click Start Mission
    F->>N: POST /api/start-mission
    N->>E: POST /start-mission
    E->>W: Update Drone State
    W->>F: Broadcast State Change
    F->>U: Update UI

    loop Every 2 seconds
        E->>W: Update Telemetry
        W->>F: Send Updates
        F->>U: Render New State
    end
```

## Screenshots/Demo

### Dashboard View

![App Screenshot 1](./images/Screenshot%202025-07-17%20225451.png)
![App Screenshot 2](./images/Screenshot%202025-07-17%20225544.png)
![App Screenshot 3](./images/Screenshot%202025-07-17%20230115.png)
