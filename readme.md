# Hex-Sovereign: A Tactical Hex-Grid Strategy Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

**Hex-Sovereign** is a high-stakes, real-time competitive strategy game played on a shifting hexagonal landscape. Players must master the delicate balance between economic expansion and military maintenance to achieve total dominance.

---

## 🎮 Game Concept

In **Hex-Sovereign**, you are an Architect-General. The world is a fractured grid where every tile is a resource, a shield, or a weapon. The core tension lies in the **Global Energy Cap**: every unit you field permanently "locks" a portion of your income, forcing players to choose between a massive economy or an unstoppable army.

### Key Pillars
* **Dynamic Territory:** Tiles must be linked to your Nexus to function.
* **Asset Specialization:** Choose between resource-heavy "Monoliths" or defensive "Bastions."
* **Hidden Information:** Use Fog of War and stealth units to sabotage enemy supply lines.

---

## 🛠 Game Mechanics

### 1. Tile Interaction
* **Capture:** Reduce a tile's Stability to 0 to flip ownership. Neutral tiles are captured quickly; enemy tiles require sustained siege.
* **Upgrading:**
    * **Monoliths:** Focus on **Essence** generation. High output, zero defense.
    * **Bastions:** Provide a defensive aura and unit garrisoning. High maintenance cost.
* **Stealing:** Use **Infiltrator** units to "hack" enemy Monoliths, diverting resource flow without alerting the owner to a physical capture.

### 2. The Nexus Link
All tiles must maintain a "Supply Chain" back to the home Nexus.
* **Decoupling:** If an enemy cuts a path in your territory, the disconnected tiles become **Dormant**.
* **Reconnection:** Players must urgently recapturing the "bridge" hexes to restore power to their outer reaches.

### 3. Fog of War
Visibility is restricted to tiles adjacent to:
* Owned Hexagons.
* Active Units.
* **Probes:** Disposable scouts that provide temporary vision over high-ground obstacles.

---

## ⚔️ Unit Classes

| Archetype | Role | Special Ability |
| :--- | :--- | :--- |
| **Vanguard** | Frontline Tank | **Phalanx:** Defense increases for every adjacent friendly Vanguard. |
| **Siphon** | Infiltrator | **Ghost Hack:** Becomes invisible in Fog of War when stationary; steals 50% of tile output. |
| **Siege-Engine**| Long-Range Artillery | **Siege Mode:** Attacks from 2 hexes away but cannot move while firing. |
| **Overseer** | Tactical Support | **Overclock:** Temporarily doubles a tile's resource output or fire rate. |

---

## 📜 Rules of Play

1.  **Objective:** Reduce the enemy **Nexus Stability** to zero.
2.  **The Maintenance Tax:** Each unit has a permanent Essence upkeep. If upkeep exceeds income, you cannot build new structures or units.
3.  **The Hex-Decay:** After 15 minutes of play, the outer ring of the map collapses into the void every 60 seconds, forcing players toward the center for a final showdown.

---

## 💻 Development & Installation

### Prerequisites
* **Engine:** Unity 2022.3 LTS / Godot 4.x
* **Language:** C# / GDScript
* **Networking:** Photon Fusion or Mirror for Real-Time Synchronization

### Setup
```bash
# Clone the repository
git clone [https://github.com/your-username/hex-sovereign.git](https://github.com/your-username/hex-sovereign.git)

# Navigate to project directory
cd hex-sovereign

# Install dependencies (if applicable)
npm install