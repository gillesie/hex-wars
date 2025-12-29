# Hex-Sovereign: Web Edition

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/backend-Node.js-green.svg)
![WebGL](https://img.shields.io/badge/frontend-Three.js%20%2F%20WebGL-orange.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Hex-Sovereign** is a high-stakes, browser-based 3D strategy game played on a shifting hexagonal landscape. Built with **Node.js** and **WebGL**, it features real-time competitive multiplayer and a challenging single-player AI mode.

Players act as Architect-Generals, mastering the delicate balance between economic expansion and military maintenance to achieve total dominance directly in the browser.

---

## 🎮 Game Concept

The world is a fractured 3D grid where every tile is a resource, a shield, or a weapon. The core tension lies in the **Global Energy Cap**: every unit you field permanently "locks" a portion of your income, forcing a strategic choice between a massive economy or an unstoppable army.

### Key Features
* **Instant Play:** No downloads required. Runs natively in modern web browsers.
* **Basic 3D Visualization:** A clean, tactical 3D view of the battlefield using WebGL.
* **Dual Modes:**
    * **PvP Arena:** Real-time matches against other players via WebSocket synchronization.
    * **PvE Skirmish:** Test your strategies against the "Automaton" CPU opponent.

---

## ⚙️ Game Mechanics

### 1. Tile Interaction
* **Capture:** Reduce a tile's Stability to 0 to flip ownership.
* **Upgrading:**
    * **Monoliths:** Focus on **Essence** generation. High output, zero defense.
    * **Bastions:** Provide a defensive aura and unit garrisoning. High maintenance cost.
* **Stealing:** Use **Infiltrator** units to "hack" enemy Monoliths, diverting resource flow purely via code injection mechanics.

### 2. The Nexus Link
All tiles must maintain a "Supply Chain" back to your home Nexus.
* **Decoupling:** If an enemy cuts a path in your territory, disconnected tiles become **Dormant** (visualized by darkening the 3D mesh).
* **Reconnection:** Recapture "bridge" hexes to restore power.

### 3. Fog of War
To optimize browser rendering and strategy, visibility is restricted to tiles adjacent to:
* Owned Hexagons.
* Active Units.
* **Probes:** Disposable scouts that provide temporary vision over high-ground obstacles.

---

## 🛡️ Unit Classes

| Archetype | Role | Special Ability |
| :--- | :--- | :--- |
| **Vanguard** | Frontline Tank | **Phalanx:** Defense increases for every adjacent friendly Vanguard. |
| **Siphon** | Infiltrator | **Ghost Hack:** Becomes invisible in Fog of War when stationary; steals 50% of tile output. |
| **Siege-Engine**| Long-Range Artillery | **Siege Mode:** Attacks from 2 hexes away but cannot move while firing. |
| **Overseer** | Tactical Support | **Overclock:** Temporarily doubles a tile's resource output or fire rate. |

---

## 🏆 Rules of Play

1.  **Objective:** Reduce the enemy **Nexus Stability** to zero.
2.  **The Maintenance Tax:** Each unit has a permanent Essence upkeep. If upkeep exceeds income, you cannot build new structures.
3.  **The Hex-Decay:** After 15 minutes of play, the outer ring of the map physically falls away (animation) every 60 seconds, shrinking the playable area.

---

## 💻 Tech Stack

* **Frontend:** HTML5, CSS3, Three.js (for 3D rendering).
* **Backend:** Node.js, Express.
* **Real-Time Comms:** Socket.io (handling game state, lobby, and chat).
* **Database:** MongoDB or Redis (for player stats and match history).

---

## 🚀 Installation & Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* npm or yarn

### Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/hex-sovereign-web.git](https://github.com/your-username/hex-sovereign-web.git)
    cd hex-sovereign-web
    ```

2.  **Install Dependencies**
    ```bash
    # Install backend and frontend dependencies
    npm install
    ```

3.  **Run Development Server**
    ```bash
    # Starts the Node server and serves the client files
    npm run dev
    ```

4.  **Access the Game**
    Open your browser and navigate to: `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start