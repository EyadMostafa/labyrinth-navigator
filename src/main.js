// --- src/main.js ---
// Main orchestration file. Initializes Three.js and runs the game loop.

// 1. Module Imports
import * as CONSTANTS from './utils/constants.js';
import { setupPlayer, updatePlayer, getPlayerObject } from './components/player.js'; 
import { createMaze, updateAnimations, getWallColliders, getKeyCrystal, getExitPortal, removeKeyCrystal } from './components/maze.js';
import { setupLighting } from './graphics/lighting.js';
import { initUI, updateUI } from './components/ui.js'; // *** NEW IMPORT ***
import { initUI, updateUI, showGameOverScreen } from './components/ui.js';

// 2. Global State Variables
let scene;
let camera;
let renderer;
let clock; 
let gameData = { 
    isRunning: false,
    timer: CONSTANTS.GAME.TIME_LIMIT,
    keyCollected: false,
    winState: false,
};
let playerObject; 
let wallColliders = []; 
const tempVector = new THREE.Vector3(); // Reusable vector for distance calculations


// 3. Initialization Function
function init() {
    console.log("Initializing Labyrinth Navigator...");

    // 3.1. Setup Core Three.js Components
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONSTANTS.COLOR.BACKGROUND);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const container = document.getElementById('gameCanvas');
    if (container) {
        container.appendChild(renderer.domElement);
    } else {
        console.error("Game canvas container not found. Check index.html.");
        return;
    }

    clock = new THREE.Clock();
    
    // 3.2. Setup Game Modules
    playerObject = setupPlayer(scene, camera); // Sets up camera and controls
    setupLighting(scene, camera); // Configures ambient and flashlight

    // Create the maze and get references
    createMaze(scene); 
    wallColliders = getWallColliders(); 
    
    // 3.3. Initial UI and Game State
    gameData.isRunning = true;
    initUI(); // Initialize UI references
    
    // 3.4. Setup Listeners
    window.addEventListener('resize', onWindowResize, false);
    
    // 3.5. Start Loop
    animate();
    console.log("Game loop started. Check the UI for timer updates.");
}

// 4. Main Game Loop (Requirement: Must render in real-time)
function animate() {
    requestAnimationFrame(animate);

    if (!gameData.isRunning) {
        updateUI(gameData); // Update UI to show win/loss state one last time
        renderer.render(scene, camera);
        return;
    }

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime(); 

    // 4.1. Core Logic Updates
    
    updateAnimations(deltaTime, elapsedTime);
    
    updatePlayer(deltaTime, gameData, wallColliders); 

    // Check Objective Collisions (Requirement G)
    checkObjectiveCollisions(playerObject, getKeyCrystal(), getExitPortal()); 

    // 4. Update Game Timer (Requirement G)
    gameData.timer = Math.max(0, gameData.timer - deltaTime);
    if (gameData.timer <= 0 && !gameData.winState) {
        gameData.isRunning = false;
        console.log("Time is up! Game Over.");
    }

    // 5. Update UI (Required every frame)
    updateUI(gameData);
    
    // 6. Render the Scene
    renderer.render(scene, camera);
}

if (distSq < collectionDistSq) {
    gameData.winState = true;
    gameData.isRunning = false;
    
    const exitMaterial = exit.material;
    exitMaterial.color.setHex(CONSTANTS.COLOR.WIN_GLOW);
    exitMaterial.emissive.setHex(CONSTANTS.COLOR.WIN_GLOW);
    
    console.log("🎉 You Escaped! Game Won!");
    showGameOverScreen(true); // ← ADD THIS LINE
}

if (gameData.timer <= 0 && !gameData.winState) {
    gameData.isRunning = false;
    console.log("⏰ Time is up! Game Over.");
    showGameOverScreen(false); // ← ADD THIS LINE
}


// --- 5. Game Logic: Objective Collision Checks (Requirement G) ---

/**
 * Handles collision/proximity checks for the Key and Exit Portal.
 * @param {THREE.Object3D} player - The player's container object.
 * @param {THREE.Mesh} key - The key crystal mesh.
 * @param {THREE.Mesh} exit - The exit portal mesh.
 */
function checkObjectiveCollisions(player, key, exit) {
    // Squared distance check is more efficient than calculating the square root
    const collectionDistSq = CONSTANTS.GAME.COLLECTION_DISTANCE ** 2;

    // --- Key Collection Logic ---
    if (!gameData.keyCollected && key) {
        // Calculate the squared distance between player and key
        // FIXED: Using distanceToSquared
        const distSq = player.position.distanceToSquared(key.position); 

        if (distSq < collectionDistSq) {
            // Key Collected! (Requirement G)
            gameData.keyCollected = true;
            removeKeyCrystal();
            console.log("Key collected! Find the exit!");
        }
    }

    // --- Exit Activation Logic ---
    if (gameData.keyCollected && !gameData.winState && exit) {
        // FIXED: Using distanceToSquared
        const distSq = player.position.distanceToSquared(exit.position);
        
        if (distSq < collectionDistSq) {
            // Player reached the exit with the key! (Requirement G)
            gameData.winState = true;
            gameData.isRunning = false;
            
            // Visual cue for winning: Change exit color (Requirement D)
            const exitMaterial = exit.material;
            exitMaterial.color.setHex(CONSTANTS.COLOR.WIN_GLOW);
            exitMaterial.emissive.setHex(CONSTANTS.COLOR.WIN_GLOW);
            
            console.log("You Escaped! Game Won!");
        }
    }
}


// 6. Utility: Handle Window Resizing
function onWindowResize() {
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Global entry point
window.onload = init;