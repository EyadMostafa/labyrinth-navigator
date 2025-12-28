// --- src/main.js (WITH LEVEL SELECTION SUPPORT) ---
// Main orchestration file. Initializes Three.js and runs the game loop.

// 1. Module Imports
import * as CONSTANTS from './utils/constants.js';
import { setupPlayer, updatePlayer, getPlayerObject } from './components/player.js'; 
import { createMaze, updateAnimations, getWallColliders, getKeyCrystal, getExitPortal, removeKeyCrystal , nextLevel, getCurrentLevelIndex, setStartingLevel } from './components/maze.js';
import { setupLighting } from './graphics/lighting.js';
import { initUI, updateUI, showGameOverScreen, showLevelTransition } from './components/ui.js';
import { startBackgroundMusic, startKeyCrystalSound, updateKeyCrystalVolume, stopKeyCrystalSound, playAfterKeyMusic, startExitPortalSound, updateExitPortalVolume, stopAllSounds, playLevelTransitionSound, stopLevelTransitionSound, stopExitPortalSound, stopAfterKeyMusic } from './utils/audioManager.js';

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

    // 3.6. Setup Video and Sound Toggle
    const startVideo = document.getElementById('start-video');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const soundIconMuted = document.getElementById('sound-icon-muted');
    const soundIconPlaying = document.getElementById('sound-icon-playing');

    if (startVideo) {
        // Start video muted
        startVideo.muted = true;
        startVideo.volume = 0.7;
        
        // Try to autoplay (will be muted)
        startVideo.play()
            .then(() => console.log('✅ Video playing (muted)'))
            .catch(err => {
                console.log('⚠️ Video autoplay failed:', err);
                // Try playing on any interaction
                const playVideo = () => {
                    startVideo.play();
                    document.removeEventListener('click', playVideo);
                };
                document.addEventListener('click', playVideo, { once: true });
            });
        
        // Sound toggle button functionality
        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent other click handlers
                
                if (startVideo.muted) {
                    // Unmute
                    startVideo.muted = false;
                    soundIconMuted.classList.add('hidden');
                    soundIconPlaying.classList.remove('hidden');
                    console.log('🔊 Sound enabled');
                } else {
                    // Mute
                    startVideo.muted = true;
                    soundIconMuted.classList.remove('hidden');
                    soundIconPlaying.classList.add('hidden');
                    console.log('🔇 Sound muted');
                }
            });
        }
    }

    // 3.7. Start Render Loop (but game is paused)
    animate();
    console.log("✓ Game initialized. Waiting for player to start...");
}

// New Function: Setup Start Button with Level Selection Support
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
        
        // Get the selected level from the HTML (set by level selection menu)
        const selectedLevel = window.getSelectedLevel ? window.getSelectedLevel() : 0;
        console.log("📍 Selected level:", selectedLevel);
        
        // Set the starting level in maze.js
        setStartingLevel(selectedLevel);
        
        // Rebuild the maze with the selected level
        createMaze(scene);
        wallColliders = getWallColliders();
        
        // Stop and remove video to save resources
        if (startVideo) {
            startVideo.pause();
            startVideo.currentTime = 0;
            startVideo.src = '';
        }
        
        // Hide start screen
        startScreen.classList.add('hidden');
        
        // Show game UI
        uiOverlay.classList.remove('hidden');
        
        // Start audio for the selected level
        startBackgroundMusic(selectedLevel);
        startKeyCrystalSound();
        
        // Start the game
        gameData.isRunning = true;
        gameData.started = true;
        
        // Reset clock
        clock.start();
        
        console.log("✅ Game started! Level " + (selectedLevel + 1));
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
        stopAllSounds(); // Stop all sounds on game over
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
 * Uses a "Flat Distance" check (ignoring height) to make collection easier.
 */
function checkObjectiveCollisions(player, key, exit) {
    const collectionDist = CONSTANTS.GAME.COLLECTION_DISTANCE;

    // Helper: Calculate distance ignoring Height (Y-axis)
    const getFlatDistance = (obj1, obj2) => {
        const dx = obj1.position.x - obj2.position.x;
        const dz = obj1.position.z - obj2.position.z;
        return Math.sqrt(dx * dx + dz * dz);
    };

    // --- 1. Key Collection Logic ---
    if (!gameData.keyCollected && key) {
        if (getFlatDistance(player, key) < collectionDist) {
            gameData.keyCollected = true;
            removeKeyCrystal();
            stopKeyCrystalSound();
            
            // Start Phase 2 music for current level
            const currentLevel = getCurrentLevelIndex();
            playAfterKeyMusic(currentLevel); // Pass level index for level-specific Phase 2 music
            
            startExitPortalSound();
            console.log("🔑 Key collected! Phase 2 music started for Level " + (currentLevel + 1));
        }
    }

    // --- 2. Exit Logic ---
    if (gameData.keyCollected && !gameData.winState && exit) {
        const distanceToExit = getFlatDistance(player, exit);
        
        if (distanceToExit < collectionDist) {
            console.log("🎯 EXIT REACHED! Processing level completion...");
            
            // GET CURRENT STATUS
            const currentLevel = getCurrentLevelIndex();
            const totalLevels = CONSTANTS.MAZE.LEVELS.length;

            console.log("📊 Current Level:", currentLevel, "/ Total Levels:", totalLevels);

            // CHECK: Is there another level after this one?
            if (currentLevel + 1 < totalLevels) {
                // YES -> Show Level Transition Screen
                console.log("✅ Level " + (currentLevel + 1) + " Complete! Showing transition...");
                
                // Pause the game
                gameData.isRunning = false;
                
                // Stop Phase 2 music and portal sound
                stopAfterKeyMusic();
                stopExitPortalSound();
                
                // Play level transition sound
                playLevelTransitionSound();
                
                // Show transition screen
                const continueBtn = showLevelTransition(currentLevel, gameData.timer);
                
                // Setup continue button to load next level
                if (continueBtn) {
                    continueBtn.onclick = () => {
                        const newLevelIndex = currentLevel + 1;
                        console.log("🎮 Loading Level " + (newLevelIndex + 1));
                        
                        // Stop transition sound
                        stopLevelTransitionSound();
                        
                        // Hide transition screen
                        document.getElementById('level-transition-screen').classList.add('hidden');
                        
                        // Load next level
                        nextLevel();
                        
                        // Reset game state
                        wallColliders = getWallColliders(); 
                        gameData.keyCollected = false;
                        gameData.timer = CONSTANTS.GAME.TIME_LIMIT;
                        gameData.isRunning = true; // Resume game
                        
                        // Start next level audio with level index
                        startBackgroundMusic(newLevelIndex); // Level-specific background music
                        startKeyCrystalSound();
                        
                        // Reset clock
                        clock.start();
                        
                        console.log("✅ Level " + (newLevelIndex + 1) + " started with level-specific music!");
                    };
                }
                
            } else {
                // NO -> WE WIN! (Stop the game)
                console.log("🎉 All Levels Complete!");
                gameData.winState = true;
                gameData.isRunning = false;
                
                // Stop Phase 2 music and portal sound
                stopAfterKeyMusic();
                stopExitPortalSound();
                
                // Show Win Screen (plays win sound in ui.js)
                showGameOverScreen(true);
            }
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