# 🚀 Chaos Chess — Scrambled Multiplayer Chess Variant

A modern, responsive, real-time multiplayer chess platform built from scratch. While the layout, pieces, and ultimate objective (checkmate) are visually identical to traditional chess, the movement rules of the four major pieces—**Queen, Rook, Bishop, and Knight**—are randomly permuted before every single match.

---

## 🎮 Game Concept & Rules

*   **Scrambled Movement**: Before each match starts, the game server randomly chooses one of the **24 possible true permutations** of piece movement rules:
    *   *Queen* $\rightarrow$ Knight, Rook, Bishop, or Queen
    *   *Rook* $\rightarrow$ Knight, Rook, Bishop, or Queen
    *   *Bishop* $\rightarrow$ Knight, Rook, Bishop, or Queen
    *   *Knight* $\rightarrow$ Knight, Rook, Bishop, or Queen
*   **Color Preference Selection**: When hosting a room, creators can select their color preference: **Play as White** (moves first), **Play as Black** (moves second), or **Random** (a coin flip determines the color). The second player who joins is automatically assigned the opposite color.
*   **Unchanged Pieces**:
    *   **King**: Always moves normally (including castling checks).
    *   **Pawn**: Always moves normally (including double-step, captures, and en passant).
*   **Pawn Promotion**: Promoting a pawn allows selection of a Queen, Rook, Bishop, or Knight. Promoted pieces inherit the *currently active movement mapping* for that match.
*   **Both Players Equal**: Both players receive the exact same rules.
*   **Objective**: Deliver checkmate using the custom movement mechanics!

---

## 🌎 Live Deployments

Chaos Chess is fully hosted and accessible for free:
- **Frontend Client (Vercel)**: `https://chaos-chess-client-521e.vercel.app`
- **Backend Server (Render)**: `https://chaos-chess-server.onrender.com`

---

## ❤️ Enjoy, Share, & Play Responsibly

Chaos Chess was built as a fun, mind-bending variant of the game we all know and love.
*   **Share with Friends**: Create a private room, copy your room code or invite link, send it to a friend, and see who can master the chaos first!
*   **Play Responsibly**: Please enjoy the website responsibly. To keep the platform fast and friendly for everyone, avoid opening excessive concurrent rooms, flooding connection sockets, or abusing the server's endpoints. Let's keep the community clean and fun for all chess fans!

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **React** (v18) with **TypeScript**
*   **Vite** (for fast bundling and development)
*   **Tailwind CSS** (for styling under a custom design system theme)
*   **react-chessboard** (for rendering pieces and squares with cursor snapping and speed animations)
*   **Zustand** (lightweight state management for game state and UI overlays)
*   **Framer Motion** (smooth layout transitions)
*   **React Router** (declarative client-side routing)
*   **Socket.IO Client** (real-time server synchronization)

### Backend (Server)
*   **Node.js** with **TypeScript**
*   **Express** (routing, health check endpoints)
*   **Socket.IO** (WebSockets server for real-time room communication and server-side validation)
*   **tsc-alias** (resolves runtime package aliases for seamless ESM builds)

### Shared Directory
*   Contains type-safe interfaces, constants, and event names compiled/shared across the frontend and backend.

---

## 📁 Project Structure

```
chaos-chess/
├── shared/
│   ├── src/
│   │   ├── types/index.ts       # Shared payload and game state types
│   │   ├── constants/index.ts   # Event names, timers, and default configurations
│   │   └── index.ts             # Main entry barrel export
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── engine/
│   │   │   ├── board.ts         # Index mappings, board clone, FEN utilities
│   │   │   ├── ruleGenerator.ts # Permutes movement mappings (1 of 24)
│   │   │   ├── moveApplicator.ts# Applies moves (castling, EP, promotions)
│   │   │   ├── moveGenerator.ts # Generates pseudo-legal moves per mapping
│   │   │   ├── attackDetector.ts# Mapped attack detection
│   │   │   ├── moveValidator.ts # Check, checkmate, stalemate calculations
│   │   │   └── gameManager.ts   # Game state state machine & server clocks
│   │   ├── rooms/
│   │   │   └── roomManager.ts   # Room creation, joining, spectator overflow, color allocation
│   │   ├── socket/
│   │   │   └── handlers.ts      # WebSockets event router handlers
│   │   ├── utils/
│   │   │   └── notation.ts      # Standard algebraic notation converter
│   │   └── index.ts             # Server entry point
│   ├── tsconfig.json
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/          # Chessboard, timers, score sheet, overlays
│   │   ├── pages/               # Landing page, Waiting lobby, Game page, 404
│   │   ├── socket/              # Socket.IO client instance and event hook
│   │   ├── store/               # Zustand store files
│   │   ├── styles/              # Global CSS & Tailwind styling setup
│   │   ├── utils/               # Coordinate formatting and board helpers
│   │   ├── App.tsx              # Routing and socket hook mount
│   │   └── main.tsx             # React DOM renderer
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── package.json                 # Monorepo Workspace Root
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Installation
In the root directory of the project, run:
```bash
npm install
```
This command leverages npm workspaces to automatically install dependencies across the `shared`, `server`, and `client` directories.

---

### 2. Running in Development Mode

#### Option A: Running from the Root Directory (Single Terminal)
You can run the client or server scripts directly from the workspace root:
```bash
# Run backend server (default: port 3001)
npm run dev:server

# Run frontend client (default: port 5173)
npm run dev:client
```

#### Option B: Running Separately (Separate Terminals)
If you prefer to run the client and server in separate terminal windows, navigate to their respective directories:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Open multiple windows/private tabs to test player lobbies and spectators.

---

### 3. Production Build & Execution
To verify compiler checks and run a production bundle locally:

```bash
# Build the server and client assets
npm run build:server
npm run build:client

# Start the compiled backend server
cd server
npm run start
```

---

## 🔍 Validation Checklist
To verify typescript type safety across folders:
```bash
# Check server compilation
cd server && npx tsc --noEmit

# Check client compilation
cd client && npx tsc --noEmit
```
Both commands will finish with an exit code of `0`, confirming complete type-safety.
