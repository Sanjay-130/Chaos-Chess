# 🚀 Chaos Chess — Scrambled Multiplayer Chess Variant

A modern, responsive, real-time multiplayer chess platform built from scratch. While the layout, pieces, and ultimate objective (checkmate) are visually identical to traditional chess, the movement rules of the four major pieces—**Queen, Rook, Bishop, and Knight**—are randomly permuted before every single match.

---

## 🎮 Game Concept & Rules

*   **Scrambled Movement**: Before each match starts, the game server randomly chooses one of the **24 possible true permutations** of piece movement rules:
    *   *Queen* $\rightarrow$ Knight, Rook, Bishop, or Queen
    *   *Rook* $\rightarrow$ Knight, Rook, Bishop, or Queen
    *   *Bishop* $\rightarrow$ Knight, Rook, Bishop, or Queen
    *   *Knight* $\rightarrow$ Knight, Rook, Bishop, or Queen
*   **Time Control Selector**: When creating a room, creators can select from popular presets (1 min, 3 min, 10 min, 15 min) or input a **custom time control** from 1 to 180 minutes.
*   **Color Preference Selection**: Creators can select their color preference: **Play as White** (moves first), **Play as Black** (moves second), or **Random**.
*   **Unchanged Pieces**:
    *   **King**: Always moves normally (including castling checks).
    *   **Pawn**: Always moves normally (including double-step, captures, and en passant).
*   **Pawn Promotion**: Promoting a pawn allows selection of a Queen, Rook, Bishop, or Knight. Promoted pieces inherit the *active movement mapping* for that match.
*   **Three-fold Repetition**: If the exact same board state, castling rights, active turn, and en passant squares repeat 3 times during the match, the game automatically concludes as a draw. The 50-move rule has been removed to allow games to play out.
*   **Last Move Highlight**: The board highlights the *from* and *to* squares of the last move in yellow, ensuring you always know what just happened.
*   **Game Review Mode**: Once a match ends, players can click the **Review Game** button to open an interactive move-by-move analysis board, complete with:
    *   Interactive forward/backward navigation (with Arrow Keys support).
    *   Full move list in standard algebraic notation.
    *   **Piece Swaps Card**: A dashboard displaying the active movement mapping (e.g. Queen moves like Rook ⚡) for quick reference.
*   **Full Rematch Flow**: Vote for a rematch directly from the Game Over dialog. Handle opponent requests, accept, decline, or cancel requests dynamically without leaving the room.
*   **Custom Sound Effects**: Immersive audio cues for moves, piece captures, check, stalemate, timeouts, agreed draws, and distinct sounds for winning checkmate vs. losing checkmate. Users can easily toggle sounds ON/OFF on the home page.
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
*   **Play Online**: Play the live game with your friends directly at [Chaos Chess Live](https://chaos-chess-client-521e.vercel.app)!
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

## 💻 Local Development

Want to run Chaos Chess on your own machine? Check out our step-by-step setup guide:

👉 **[Local Development & Setup Guide](file:///d:/Projects/Chaos-Chess/RUN_LOCALLY.md)**

