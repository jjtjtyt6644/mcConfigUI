# Aetheris - High-Performance Multi-Tenant Minecraft Cloud Hosting Platform

Aetheris is an architecture built specifically to leverage the **Oracle Cloud Always Free ARM VM** (4 OCPUs, 24GB RAM) as the host backend game engine, coupled with **Vercel** for instant, global CDN frontend delivery.

---

## 🏗️ Dual-Layer Architecture

```
                 +-------------------------------------------------+
                 |               VERCEL EDGE / CDN                 |
                 |  Next.js (App Router) + Tailwind + Lucide Icons |
                 +-------------------------------------------------+
                                       |
                   REST APIs & WebSockets (/ws/terminal)
                                       v
+---------------------------------------------------------------------------------+
|               ORACLE CLOUD ALWAYS FREE ARM VM (24GB RAM, 4 OCPUs)               |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   |                      Express API & Engine Daemon (Port 4000)            |   |
|   |  - Dockerode Engine Orchestrator                                        |   |
|   |  - Automated PaperMC / Purpur / Fabric Version Downloader               |   |
|   |  - RCON Client Command Dispatcher & OP Manager                          |   |
|   |  - Lifecycle Engine (5-min 0-Player Inactivity Stop & 20GB RAM Queue)   |   |
|   +-------------------------------------------------------------------------+   |
|                                       |                                         |
|                               Docker Socket                                     |
|                                       v                                         |
|    +-----------------------------------------------------------------------+    |
|    | Isolated Docker Containers (ARM64 OpenJDK 21)                         |    |
|    |  - server_1 (2GB RAM Cap, 1 CPU thread) -> /data/servers/server_1     |    |
|    |  - server_2 (2GB RAM Cap, 1 CPU thread) -> /data/servers/server_2     |    |
|    +-----------------------------------------------------------------------+    |
+---------------------------------------------------------------------------------+
```

---

## 🚀 Setup & Deployment Guide

### Part 1: Deploy Backend to Oracle Cloud Always Free ARM VM

1. **Provision your Oracle Cloud VM**:
   - Shape: `VM.Standard.A1.Flex` (4 OCPUs, 24GB RAM)
   - OS: Ubuntu 22.04 LTS

2. **Open Firewall Ports in Oracle VCN & Ubuntu**:
   - In Oracle VCN Ingress Rules & `ufw`:
     - `4000` (Backend API & WebSocket terminal)
     - `25565 - 25600` (Minecraft game ports)

3. **Install Dependencies on the VM**:
   ```bash
   sudo apt update && sudo apt install -y docker.io nodejs npm git
   sudo usermod -aG docker $USER
   # Restart session or run: newgrp docker
   ```

4. **Clone & Run Backend**:
   ```bash
   git clone <your-repo>
   cd minecraftconfigweb/backend
   cp .env.example .env
   npm install
   npm run dev # Or use pm2: pm2 start src/server.js --name aetheris-backend
   ```

---

### Part 2: Deploy Frontend to Vercel

1. Push this repository to GitHub / GitLab.
2. In Vercel:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL`: `http://<YOUR_ORACLE_VM_IP>:4000`
     - `NEXT_PUBLIC_WS_URL`: `ws://<YOUR_ORACLE_VM_IP>:4000`
3. Click **Deploy**.

---

### Part 3: Local Testing

To run both backend and frontend on your machine:

1. **Terminal 1 (Backend)**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Terminal 2 (Frontend)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
