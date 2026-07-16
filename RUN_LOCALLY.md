# 🚀 How to Run Chaos Chess Locally

This guide will walk you through setting up and running the Chaos Chess project on your local machine for development and testing.

---

## 📋 Prerequisites

Before starting, ensure you have:
*   [Node.js](https://nodejs.org/) installed (v18+ recommended)
*   [Git](https://git-scm.com/) installed (to clone the repository)

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
If you haven't already, clone the project to your local machine:
```bash
git clone https://github.com/Sanjay-130/Chaos-Chess.git
cd Chaos-Chess
```

### 2. Install Dependencies
Run the following command in the project root directory:
```bash
npm install
```
> [!NOTE]
> This project uses **npm workspaces**. Running `npm install` at the root automatically installs and links all dependencies for the `shared`, `server`, and `client` directories in one go.

---

## 🛠️ Running in Development Mode

You can run the frontend and backend simultaneously or in separate terminal windows.

### Option A: From the Root Directory (Single Terminal)
You can launch either service directly from the workspace root:

```bash
# Start the backend server (default: port 3001)
npm run dev:server

# Start the frontend client (default: port 5173)
npm run dev:client
```

### Option B: Using Separate Terminals (Recommended)
Navigating to the respective package directories is often easier for tracking console logs:

*   **Terminal 1 (Backend Server):**
    ```bash
    cd server
    npm run dev
    ```

*   **Terminal 2 (Frontend Client):**
    ```bash
    cd client
    npm run dev
    ```

Once both are running, open **[http://localhost:5173](http://localhost:5173)** in your web browser. 

> [!TIP]
> Open an incognito/private tab to connect as a second player and test matches locally!

---

## 📦 Production Build & Execution

To test production builds locally:

1. **Build all assets:**
   ```bash
   npm run build:server
   npm run build:client
   ```
2. **Start the production server:**
   ```bash
   cd server
   npm run start
   ```

---

## 🔍 Code Validation (TypeScript Check)

To run static type analysis and verify there are no compilation errors:
```bash
# Check backend server types
cd server && npx tsc --noEmit

# Check frontend client types
cd client && npx tsc --noEmit
```
Both commands should exit with a code of `0`, confirming complete type-safety.
