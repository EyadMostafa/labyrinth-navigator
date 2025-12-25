// --- src/main.js ---
// Main orchestration file. Initializes Three.js and runs the game loop.

// 1. Module Imports
import * as CONSTANTS from './utils/constants.js';
import { setupPlayer, updatePlayer, getPlayerObject } from './components/player.js'; 
import { createMaze, updateAnimations, getWallColliders, getKeyCrystal, getExitPortal, removeKeyCrystal } from './components/maze.js';
import { setupLighting } from './graphics/lighting.js';
import { initUI, updateUI, showGameOverScreen } from './components/ui.js';
import { startBackgroundMusic, startKeyCrystalSound, updateKeyCrystalVolume, stopKeyCrystalSound, playAfterKeyMusic, startExitPortalSound, updateExitPortalVolume } from './utils/audioManager.js';

// 2. Global State Variables
let scene;
let camera;
let renderer;
let clock; 
let gameData = { 
    isRunning: false,
    started: false, // Game hasn't started yet
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
    
    // 3.3. Initial UI (but don't start game yet)
    initUI(); // Initialize UI references
    
    // 3.4. Setup Listeners
    window.addEventListener('resize', onWindowResize, false);
    
    // 3.5. Setup Start Button
    setupStartButton();

    // Force video to play (add this)
    const startVideo = document.getElementById('start-video');
    if (startVideo) {
        startVideo.play().catch(err => console.log('Video autoplay blocked:', err));
    }

    // 3.6. Setup Listeners
    window.addEventListener('resize', onWindowResize, false);

    // 3.6. Start Render Loop (but game is paused)
    animate();
    console.log("✓ Game initialized. Waiting for player to start...");
}

// New Function: Setup Start Button
function setupStartButton() {
    const startButton = document.getElementById('start-game-btn');
    const startScreen = document.getElementById('start-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    const startVideo = document.getElementById('start-video');
    
    if (!startButton) {
        console.error("Start button not found!");
        return;
    }
    
    startButton.addEventListener('click', () => {
        console.log("🎮 Starting game...");
        // Stop and remove video to save resources
        if (startVideo) {
            startVideo.pause();
            startVideo.src = '';
        }
        
        // Hide start screen
        startScreen.classList.add('hidden');
        
        // Show game UI
        uiOverlay.classList.remove('hidden');
        
        // Start all audio
        startBackgroundMusic();
        startKeyCrystalSound();
        
        // Start the game
        gameData.isRunning = true;
        gameData.started = true;
        
        // Reset clock
        clock.start();
        
        console.log("✅ Game started!");
    });
}

// 4. Main Game Loop
function animate() {
    requestAnimationFrame(animate);

    // Always render the scene (even before game starts)
    if (!gameData.started) {
        renderer.render(scene, camera);
        return;
    }

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

    // 4.2. Get references to key and exit (get once, use multiple times)
    const key = getKeyCrystal();
    const exit = getExitPortal();

    // 4.3. Update spatial audio volumes based on distance
    if (key && !gameData.keyCollected) {
        const distanceToKey = playerObject.position.distanceTo(key.position);
        updateKeyCrystalVolume(distanceToKey);
    }
    
    if (exit && gameData.keyCollected && !gameData.winState) {
        const distanceToExit = playerObject.position.distanceTo(exit.position);
        updateExitPortalVolume(distanceToExit);
    }

    // 4.4. Check Objective Collisions (reuse key and exit variables)
    checkObjectiveCollisions(playerObject, key, exit); 

    // 4.5. Update Game Timer
    gameData.timer = Math.max(0, gameData.timer - deltaTime);
    if (gameData.timer <= 0 && !gameData.winState) {
        gameData.isRunning = false;
        console.log("⏰ Time is up! Game Over.");
        showGameOverScreen(false); // Show loss screen
    }

    // 4.6. Update UI
    updateUI(gameData);
    
    // 4.7. Render the Scene
    renderer.render(scene, camera);
}


// 5. Game Logic: Objective Collision Checks

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
        const distSq = player.position.distanceToSquared(key.position); 

        if (distSq < collectionDistSq) {
            // Key Collected!
            gameData.keyCollected = true;
            removeKeyCrystal();
            stopKeyCrystalSound();
            playAfterKeyMusic();
            startExitPortalSound();
            console.log("🔑 Key collected! Find the exit!");
        }
    }

    // --- Exit Activation Logic ---
    if (gameData.keyCollected && !gameData.winState && exit) {
        const distSq = player.position.distanceToSquared(exit.position);
        
        if (distSq < collectionDistSq) {
            // Player reached the exit with the key!
            gameData.winState = true;
            gameData.isRunning = false;
            
            // Visual cue for winning: Change exit color
            const exitMaterial = exit.material;
            exitMaterial.color.setHex(CONSTANTS.COLOR.WIN_GLOW);
            exitMaterial.emissive.setHex(CONSTANTS.COLOR.WIN_GLOW);
            
            console.log("🎉 You Escaped! Game Won!");
            showGameOverScreen(true); // Show win screen
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