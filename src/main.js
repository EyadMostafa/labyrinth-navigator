// --- src/main.js (PHASE 4: COMPLETE ENTITY SYSTEM) ---
// Main orchestration file. Initializes Three.js and runs the game loop.

// 1. Module Imports
import * as CONSTANTS from './utils/constants.js';
import { setupPlayer, updatePlayer, getPlayerObject, setHasKeyCrystal, isPlayerMoving, isPlayerLookingBack } from './components/player.js'; 
import { createMaze, updateAnimations, getWallColliders, getKeyCrystal, getExitPortal, removeKeyCrystal , nextLevel, getCurrentLevelIndex, setStartingLevel } from './components/maze.js';
import { setupLighting, activateBreathingLight, deactivateBreathingLight, updateBreathingLight } from './graphics/lighting.js';
import { initUI, updateUI, showGameOverScreen, showLevelTransition, showEntityTimer, hideEntityTimer, updateEntityTimer, showEntityDeathScreen } from './components/ui.js';
import { 
    startBackgroundMusic, 
    startKeyCrystalSound, 
    updateKeyCrystalVolume, 
    stopKeyCrystalSound, 
    playAfterKeyMusic, 
    startExitPortalSound, 
    updateExitPortalVolume, 
    stopAllSounds, 
    playLevelTransitionSound, 
    stopLevelTransitionSound, 
    stopExitPortalSound, 
    stopAfterKeyMusic,
    activateFalseEcho,
    deactivateFalseEcho,
    updateFalseEcho
} from './utils/audioManager.js';
// PHASE 4: Entity imports
import { spawnEntity, updateEntity, setPlayerLookingBack, removeEntity, getEntityTimer, isEntityActive } from './components/entity.js';

// 2. Global State Variables
let scene;
let camera;
let renderer;
let clock; 
let gameData = { 
    isRunning: false,
    started: false,
    timer: CONSTANTS.GAME.TIME_LIMIT,
    keyCollected: false,
    winState: false,
};
let playerObject; 
let wallColliders = []; 
const tempVector = new THREE.Vector3();

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
    playerObject = setupPlayer(scene, camera);
    setupLighting(scene, camera);

    // Create the maze and get references
    createMaze(scene); 
    wallColliders = getWallColliders(); 
    
    // 3.3. Initial UI
    initUI();
    
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
        startVideo.muted = true;
        startVideo.volume = 0.7;
        
        startVideo.play()
            .then(() => console.log('✅ Video playing (muted)'))
            .catch(err => {
                console.log('⚠️ Video autoplay failed:', err);
                const playVideo = () => {
                    startVideo.play();
                    document.removeEventListener('click', playVideo);
                };
                document.addEventListener('click', playVideo, { once: true });
            });
        
        if (soundToggleBtn) {
            soundToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (startVideo.muted) {
                    startVideo.muted = false;
                    soundIconMuted.classList.add('hidden');
                    soundIconPlaying.classList.remove('hidden');
                    console.log('🔊 Sound enabled');
                } else {
                    startVideo.muted = true;
                    soundIconMuted.classList.remove('hidden');
                    soundIconPlaying.classList.add('hidden');
                    console.log('🔇 Sound muted');
                }
            });
        }
    }

    // 3.7. Start Render Loop
    animate();
    console.log("✓ Game initialized. Waiting for player to start...");
}

// Setup Start Button with Level Selection Support
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
        
        const selectedLevel = window.getSelectedLevel ? window.getSelectedLevel() : 0;
        console.log("📍 Selected level:", selectedLevel);
        
        setStartingLevel(selectedLevel);
        createMaze(scene);
        wallColliders = getWallColliders();
        
        if (startVideo) {
            startVideo.pause();
            startVideo.currentTime = 0;
            startVideo.src = '';
        }
        
        startScreen.classList.add('hidden');
        uiOverlay.classList.remove('hidden');
        
        // Set timer based on level (Level 3 gets 120 seconds)
        if (selectedLevel === 2) {
            gameData.timer = CONSTANTS.GAME.TIME_LIMIT_LEVEL3; // 120 seconds
            activateBreathingLight();
            activateFalseEcho(); // PHASE 2: Activate false echo at level START
            console.log("💀 Level 3: 120s timer + breathing effect + FALSE ECHO activated!");
        } else {
            gameData.timer = CONSTANTS.GAME.TIME_LIMIT; // 60 seconds for Level 1 & 2
        }
        
        startBackgroundMusic(selectedLevel);
        startKeyCrystalSound();
        
        gameData.isRunning = true;
        gameData.started = true;
        
        clock.start();
        
        console.log("✅ Game started! Level " + (selectedLevel + 1) + " with " + gameData.timer + "s timer");
    });
}

// 4. Main Game Loop
function animate() {
    requestAnimationFrame(animate);

    if (!gameData.started) {
        renderer.render(scene, camera);
        return;
    }

    if (!gameData.isRunning) {
        updateUI(gameData);
        renderer.render(scene, camera);
        return;
    }

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime(); 

    // PHASE 1: Update breathing light effect
    updateBreathingLight(elapsedTime);

    // PHASE 2: Update false echo system (check if player is moving)
    const playerMoving = isPlayerMoving();
    updateFalseEcho(playerMoving);

    // PHASE 4: Update entity system and check for death
    if (isEntityActive()) {
        const lookingBack = isPlayerLookingBack();
        setPlayerLookingBack(lookingBack); // Tell entity if player is looking back
        
        const entityKilledPlayer = updateEntity(deltaTime);
        
        if (entityKilledPlayer) {
            // ENTITY CAUGHT PLAYER - DEATH!
            gameData.isRunning = false;
            stopAllSounds();
            hideEntityTimer();
            removeEntity();
            
            console.log("💀💀💀 ENTITY KILLED PLAYER! Showing death screen...");
            showEntityDeathScreen(); // Show jumpscare video then loss screen
            return; // Stop game loop
        }
        
        // Update entity timer UI
        const entityTimer = getEntityTimer();
        updateEntityTimer(entityTimer);
    }

    // 4.1. Core Logic Updates
    updateAnimations(deltaTime, elapsedTime);
    updatePlayer(deltaTime, gameData, wallColliders); 

    // 4.2. Get references to key and exit
    const key = getKeyCrystal();
    const exit = getExitPortal();

    // 4.3. Update spatial audio volumes
    if (key && !gameData.keyCollected) {
        const distanceToKey = playerObject.position.distanceTo(key.position);
        updateKeyCrystalVolume(distanceToKey);
    }
    
    if (exit && gameData.keyCollected && !gameData.winState) {
        const distanceToExit = playerObject.position.distanceTo(exit.position);
        updateExitPortalVolume(distanceToExit);
    }

    // 4.4. Check Objective Collisions
    checkObjectiveCollisions(playerObject, key, exit); 

    // 4.5. Update Game Timer
    gameData.timer = Math.max(0, gameData.timer - deltaTime);
    if (gameData.timer <= 0 && !gameData.winState) {
        gameData.isRunning = false;
        stopAllSounds();
        hideEntityTimer(); // PHASE 4: Hide entity timer
        removeEntity(); // PHASE 4: Remove entity
        console.log("⏰ Time is up! Game Over.");
        showGameOverScreen(false);
    }

    // 4.6. Update UI
    updateUI(gameData);
    
    // 4.7. Render the Scene
    renderer.render(scene, camera);
}

// 5. Game Logic: Objective Collision Checks
function checkObjectiveCollisions(player, key, exit) {
    const collectionDist = CONSTANTS.GAME.COLLECTION_DISTANCE;

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
            
            const currentLevel = getCurrentLevelIndex();
            
            // PHASE 1, 2, 4: Apply Level 3 effects
            if (currentLevel === 2) {
                setHasKeyCrystal(true); // Activate 60% speed reduction (5 → 3)
                console.log("💎 Crystal weight effect applied! Speed reduced to 60% (3 units/sec)");
                
                // False echo is ALREADY active from level start
                
                // PHASE 4: Spawn the entity!
                spawnEntity(scene, playerObject, camera);
                showEntityTimer();
                console.log("👹 ENTITY SPAWNED! Timer started at 5.0 seconds. Press L to look back!");
            }
            
            playAfterKeyMusic(currentLevel);
            startExitPortalSound();
            console.log("🔑 Key collected! Phase 2 music started for Level " + (currentLevel + 1));
        }
    }

    // --- 2. Exit Logic ---
    if (gameData.keyCollected && !gameData.winState && exit) {
        const distanceToExit = getFlatDistance(player, exit);
        
        if (distanceToExit < collectionDist) {
            console.log("🎯 EXIT REACHED! Processing level completion...");
            
            const currentLevel = getCurrentLevelIndex();
            const totalLevels = CONSTANTS.MAZE.LEVELS.length;

            console.log("📊 Current Level:", currentLevel, "/ Total Levels:", totalLevels);

            if (currentLevel + 1 < totalLevels) {
                console.log("✅ Level " + (currentLevel + 1) + " Complete! Showing transition...");
                
                gameData.isRunning = false;
                
                stopAfterKeyMusic();
                stopExitPortalSound();
                
                // Deactivate Level 3 effects if transitioning
                if (currentLevel === 2) {
                    deactivateBreathingLight();
                    deactivateFalseEcho(); // PHASE 2: Stop false echo
                    hideEntityTimer(); // PHASE 4: Hide entity timer
                    removeEntity(); // PHASE 4: Remove entity
                }
                
                playLevelTransitionSound();
                
                const continueBtn = showLevelTransition(currentLevel, gameData.timer);
                
                if (continueBtn) {
                    continueBtn.onclick = () => {
                        const newLevelIndex = currentLevel + 1;
                        console.log("🎮 Loading Level " + (newLevelIndex + 1));
                        
                        stopLevelTransitionSound();
                        document.getElementById('level-transition-screen').classList.add('hidden');
                        
                        nextLevel();
                        
                        wallColliders = getWallColliders(); 
                        gameData.keyCollected = false;
                        
                        // Set appropriate timer for new level
                        if (newLevelIndex === 2) {
                            gameData.timer = CONSTANTS.GAME.TIME_LIMIT_LEVEL3; // 120s for Level 3
                            activateBreathingLight();
                            activateFalseEcho(); // PHASE 2: Activate false echo when entering Level 3
                        } else {
                            gameData.timer = CONSTANTS.GAME.TIME_LIMIT; // 60s for other levels
                        }
                        
                        gameData.isRunning = true;
                        
                        startBackgroundMusic(newLevelIndex);
                        startKeyCrystalSound();
                        
                        clock.start();
                        
                        console.log("✅ Level " + (newLevelIndex + 1) + " started with " + gameData.timer + "s timer!");
                    };
                }
                
            } else {
                console.log("🎉 All Levels Complete!");
                gameData.winState = true;
                gameData.isRunning = false;
                
                stopAfterKeyMusic();
                stopExitPortalSound();
                deactivateBreathingLight();
                deactivateFalseEcho(); // PHASE 2: Stop false echo
                hideEntityTimer(); // PHASE 4: Hide entity timer
                removeEntity(); // PHASE 4: Remove entity
                
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