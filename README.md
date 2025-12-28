# 🕹️ Labyrinth Navigator: Shadow Passage

<div align="center">

![Game Banner](assets/images/ghost%20icon.jfif)

**A First-Person 3D Horror Maze Game Built with Three.js**

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red?style=for-the-badge&logo=webgl)](https://www.khronos.org/webgl/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Game Mechanics](#-game-mechanics)
- [Level Progression](#-level-progression)
- [Installation](#-installation)
- [How to Play](#-how-to-play)
- [Technical Stack](#-technical-stack)
- [Project Structure](#-project-structure)
- [Graphics Features](#-graphics-features)
- [Audio System](#-audio-system)

---

## 🎯 Overview

**Labyrinth Navigator** is an immersive first-person horror maze game that challenges players to escape from three progressively terrifying levels. Built entirely with **Three.js** and vanilla JavaScript, the game features dynamic lighting, spatial audio, and a unique entity AI system inspired by SCP-173 and Weeping Angels.

### 🌟 Key Highlights

- **Three Unique Levels**: From beginner-friendly to nightmare difficulty
- **Advanced AI Entity**: Level 3 features a Weeping Angels-style enemy that only moves when not observed
- **Dynamic Lighting System**: Breathing light effects and real-time shadows
- **Spatial Audio**: 3D positional audio with distance-based volume
- **Level Selection Menu**: Choose your starting challenge
- **Psychological Horror**: False echo audio system that plays sounds when you stop moving

---

## ✨ Features

### 🎮 Core Gameplay
- **First-Person Camera Control**: Mouse look with pointer lock API
- **WASD Movement**: Smooth character controller with collision detection
- **Three Difficulty Levels**: Progressive challenge system
- **Time-Based Challenge**: Beat each level before the timer runs out
- **Key & Exit System**: Find the crystal key to unlock the exit portal

### 👻 Horror Elements
- **Breathing Light Effect** (Level 3): Pulsing flashlight intensity creates anxiety
- **False Echo Audio** (Level 3): Hear footsteps and whispers when you stop moving
- **The Trapped Soul Entity** (Level 3): AI-controlled enemy that follows you
  - Only freezes when caught in your flashlight beam
  - Press **L** to look behind and reset the entity timer
  - Sophisticated view cone detection system
  - Death animation with jumpscare video

### 🎨 Graphics Features
- **Dynamic Shadows**: Real-time shadow mapping
- **Textured Environments**: Custom wall and floor textures
- **Particle Effects**: Glowing emissive materials for key and exit
- **Smooth Animations**: Rotating keys and oscillating obstacles
- **Post-Processing**: Screen effects and vignetting

### 🔊 Audio System
- **Level-Specific Music**: Each level has unique background tracks
- **Phase-Based Audio**: Music changes after collecting the key
- **Spatial Sound**: 3D positional audio for key and exit portal
- **Footstep System**: Dynamic footstep sounds with cooldown
- **False Echo Horror**: Contextual scary sounds triggered by player behavior

---

## 🎮 Game Mechanics

### Movement System
```
W - Move Forward
A - Move Left
S - Move Backward
D - Move Right
Mouse - Look Around (Pointer Lock)
E - Look Behind (Level 3 only)
```

### Speed Modifiers (Level 3)
| State | Speed | Description |
|-------|-------|-------------|
| Normal | 100% (5 units/sec) | Default movement speed |
| Holding Crystal | 60% (3 units/sec) | Slowed by the weight of the crystal |
| Looking Back (E key) | 30% (1.5 units/sec) | Very slow while facing the entity |

### Entity AI Behavior (Level 3)
The entity follows these rules:
1. **Spawns 15 units behind player** after crystal collection
2. **Moves at 2 units/second** when not observed
3. **Freezes completely** when caught in flashlight beam
4. **5-second timer** counts down when entity is not in view
5. **Timer resets** when entity is caught in flashlight
6. **Instant death** if timer reaches 0

---

## 📊 Level Progression

### 🟢 Level 1: Shadow Passage
**Difficulty**: Easy  
**Time Limit**: 60 seconds  
**Grid Size**: 14×7  
**Features**:
- Simple layout for learning controls
- One moving obstacle
- Basic maze navigation

### 🟡 Level 2: The Haunted Halls
**Difficulty**: Medium  
**Time Limit**: 60 seconds  
**Grid Size**: 21×11  
**Features**:
- Complex corridors and dead ends
- Multiple moving obstacles
- Non-linear pathfinding required

### 🔴 Level 3: Trapped Soul
**Difficulty**: Hard  
**Time Limit**: 120 seconds  
**Grid Size**: 25×21  
**Features**:
- **Breathing light effect**: Pulsing flashlight intensity
- **False echo audio**: Creepy sounds when standing still
- **Crystal weight**: Movement speed reduced to 60%
- **The Entity**: AI-controlled enemy that hunts you
- **Look-back mechanic**: Press E to survive

---

## 🚀 Installation

### Prerequisites
- Modern web browser with WebGL 2.0 support
- Local web server (for development)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/EyadMostafa/labyrinth-navigator.git
cd labyrinth-navigator
```
2. **Install dependencies**
```bash
npm install
```
3. **Start a local server**
**Option A: Python**
```bash
python -m http.server 8000
```

**Option B: Node.js**
```bash
npx http-server -p 8000
```

**Option C: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

4. **Open in browser**
```
http://localhost:8000
```
---

## 🎯 How to Play

### Starting the Game
1. Select your desired level from the menu (1, 2, or 3)
2. Read the instructions on the start screen
3. Click "START GAME"
4. Click anywhere to activate mouse look

### Objective
1. **Find the Green Crystal Key** 💎
   - Listen for spatial audio cues
   - Follow the glowing green light
2. **Reach the Orange Exit Portal** 🚪
   - Only unlocks after collecting the key
   - Portal glows orange and emits sound
3. **Beat the Timer** ⏱️
   - Level 1 & 2: 60 seconds
   - Level 3: 120 seconds

### Level 3 Survival Tips
- **Keep moving**: False echo sounds are creepy but harmless
- **Watch the entity timer**: Yellow = safe, Orange = warning, Red = critical
- **Use L key strategically**: Don't waste time looking back constantly
- **Plan your route**: Memorize the path before collecting the crystal
- **Stay in lit areas**: Entity is easier to spot in your flashlight beam

---

## 🛠️ Technical Stack

### Core Technologies
- **Three.js r128**: 3D rendering engine
- **JavaScript ES6+**: Modern module system
- **HTML5 Canvas**: WebGL rendering context
- **Web Audio API**: 3D spatial audio
- **Pointer Lock API**: First-person camera control

### Browser APIs Used
- **WebGL 2.0**: Hardware-accelerated 3D graphics
- **requestAnimationFrame**: 60 FPS game loop
- **Performance API**: Delta time calculations
- **FileReader API**: Asset loading

### Development Approach
- **No Framework**: Pure vanilla JavaScript
- **Modular Architecture**: ES6 import/export
- **Component-Based**: Separation of concerns
- **Event-Driven**: Input handling and game state

---

## 📁 Project Structure

```
labyrinth-navigator/
├── index.html                 # Main HTML entry point
├── README.md                  # This file
├── assets/
│   ├── images/               # Textures and sprites
│   │   ├── entity_sprite.jfif
│   │   ├── floor_texture.jpg
│   │   └── wall_texture.jpg
│   ├── sounds/               # Audio files
│   │   ├── level 1 - spooky-piano-and-vox.mp3
│   │   ├── footsteps_*.mp3
│   │   └── ghost-whispers.wav
│   └── videos/               # Cutscene videos
│       ├── scary story.mp4
│       └── trapped soul video 1.mp4
├── src/
│   ├── main.js               # Game initialization and loop
│   ├── components/
│   │   ├── entity.js         # Level 3 AI entity system
│   │   ├── maze.js           # Maze generation and objects
│   │   ├── player.js         # Player controller and input
│   │   └── ui.js             # HUD and UI updates
│   ├── graphics/
│   │   └── lighting.js       # Dynamic lighting system
│   └── utils/
│       ├── audioManager.js   # Audio playback and spatial sound
│       └── constants.js      # Game configuration
└── docs/
    └── project proposal.pdf
```

---

## 🎨 Graphics Features

### Lighting System
- **Ambient Light**: Low-intensity global illumination (0.1 intensity)
- **Spotlight (Flashlight)**: Dynamic player-attached light
  - Distance: 50 units
  - Angle: 27° cone
  - Shadow mapping enabled
- **Breathing Effect** (Level 3): Sine wave intensity modulation
  - Base intensity: 2.5
  - Variation: ±1.5 (pulses from 1.0 to 4.0)
  - Frequency: 2.5 Hz (heartbeat rhythm)

### Materials & Textures
- **Walls**: Phong material with brick texture
  - Repeat wrapping: 2×1
  - Shininess: 10
- **Floor**: Phong material with tiled texture
  - Repeat wrapping: 8×8
  - Double-sided rendering
- **Key Crystal**: Dodecahedron with emissive green
  - Emissive intensity: 0.8
  - Rotating animation (1 rad/sec)
- **Exit Portal**: Torus knot with emissive orange
  - Transparent: opacity 0.8
  - Emissive intensity: 0.6

### Shadow Rendering
- **Shadow Map Size**: 1024×1024
- **Shadow Type**: PCFSoftShadowMap
- **Cast Shadows**: Walls, obstacles, key
- **Receive Shadows**: Floor, walls

---

## 🔊 Audio System

### Music Layers
Each level has two musical phases:

**Phase 1: Before Key Collection**
- Level 1: `spooky-piano-and-vox.mp3`
- Level 2: `Goetia-Dark-Magic-Music.mp3`
- Level 3: Arabic horror ambience

**Phase 2: After Key Collection**
- Level 1/3: `bugs-bats-and-bells-soundscape.wav`
- Level 2: `creepy-war-atmosphere.mp3`

### Spatial Audio
- **Key Crystal Sound**: Distance-based volume (max 20 units)
- **Exit Portal Sound**: Distance-based volume (max 25 units)
- **3D Positioning**: Uses Web Audio API panners

### False Echo System (Level 3)
- **Trigger**: Player stops moving
- **Delay**: 0.5 seconds after stopping
- **Cooldown**: 3 seconds between echoes
- **Sound Pool**: Footsteps, ghost whispers
- **Volume**: 40% (subtle horror)

---

## 🎓 Learning Outcomes

This project demonstrates:

### Computer Graphics Concepts
- ✅ 3D transformations and matrix operations
- ✅ Camera systems (perspective projection)
- ✅ Lighting models (Phong shading)
- ✅ Shadow mapping techniques
- ✅ Texture mapping and UV coordinates
- ✅ Scene graph hierarchy

### Game Development
- ✅ Game loop architecture (update/render)
- ✅ Collision detection (AABB vs Sphere)
- ✅ Input handling and state management
- ✅ AI pathfinding and behavior
- ✅ Audio programming (spatial sound)
- ✅ Level design and progression

### Software Engineering
- ✅ Modular code architecture
- ✅ ES6 module system
- ✅ Event-driven programming
- ✅ Performance optimization
- ✅ Asset management
- ✅ Browser API integration

---

### Assets & Resources
- **Three.js**: Ricardo Cabello (mrdoob)
- **Textures**: [Source attributions]
- **Audio**: [Source attributions]
- **Inspiration**: SCP Foundation, Doctor Who (Weeping Angels)

### Special Thanks
- Three.js community for documentation
- WebGL specifications and tutorials
- Open-source game development resources

---

## 🐛 Known Issues

- Entity sprite may flicker at certain angles due to billboard rendering
- Audio may not autoplay on some mobile browsers due to browser policies
- Performance may vary on older hardware (target: 60 FPS on modern devices)

---


<div align="center">

### 🌟 If you enjoyed this game, please give it a star! ⭐

**Made with ❤️ and Three.js**

[⬆ Back to Top](#-labyrinth-navigator-shadow-passage)

</div>
