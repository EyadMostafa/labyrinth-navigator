// --- src/utils/audioManager.js (PHASE 2: FALSE ECHO SYSTEM) ---
// Handles all game audio (music, footsteps, spatial sounds, and FALSE ECHO)

let backgroundMusic = null;
let backgroundMusicAfterKey = null;
let footstepSound = null;
let footstepCooldown = 0;
let keyCrystalSound = null;
let exitPortalSound = null;
let levelTransitionSound = null;
let levelTransitionSound2 = null;

// PHASE 2: False Echo System Variables
let falseEchoTimer = null;
let falseEchoActive = false;
let lastEchoTime = 0;
let currentEchoSound = null;

const FALSE_ECHO_DELAY = 0.5; // Delay before playing echo (seconds)
const FALSE_ECHO_COOLDOWN = 3.0; // Minimum time between echoes (seconds)

// Pool of creepy sounds for false echo (ONLY footsteps and whispers)
const FALSE_ECHO_SOUNDS = [
    './assets/sounds/footsteps_sneakers_trainers_leather_large_running_on_hard_ground_road_concrete_etc_97389_zapsplat_foley.mp3',
    './assets/sounds/ghost-whispers.wav',
];

/**
 * Initializes and starts background music for a specific level
 * @param {number} levelIndex - The level number (0 = Level 1, 1 = Level 2, etc.)
 */
export function startBackgroundMusic(levelIndex = 0) {
    stopBackgroundMusic(); // Stop any existing music
    
    // Map level to audio file
    const musicFiles = [
        './assets/sounds/level 1 - spooky-piano-and-vox.mp3',  // Level 1
        './assets/sounds/level 2 - Goetia-Dark-Magic-Music.mp3',  // Level 2
        './assets/sounds/مؤثرات رعب احمد يونس.mp3',  // Level 3
    ];
    
    const musicFile = musicFiles[levelIndex] || musicFiles[0];
    
    backgroundMusic = new Audio(musicFile);
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    backgroundMusic.play().catch(err => console.log('Background music failed:', err));
    console.log(`🎵 Level ${levelIndex + 1} background music started`);
}

/**
 * Stops the current background music
 */
export function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        backgroundMusic = null;
    }
}

/**
 * Plays the "after key collected" background music for specific level
 * @param {number} levelIndex - The level number
 */
export function playAfterKeyMusic(levelIndex = 0) {
    stopBackgroundMusic();
    
    // Map level to phase 2 audio
    const phase2Files = [
        './assets/sounds/level 1-2 bugs-bats-and-bells-soundscape.wav',  // Level 1 Phase 2
        './assets/sounds/level 2-2 creepy-war-atmosphere-will-give-you-goosebumps.mp3',  // Level 2 Phase 2
        './assets/sounds/level 1-2 bugs-bats-and-bells-soundscape.wav',  // Level 3 Phase 2
    ];
    
    const musicFile = phase2Files[levelIndex] || phase2Files[0];
    
    backgroundMusicAfterKey = new Audio(musicFile);
    backgroundMusicAfterKey.loop = true;
    backgroundMusicAfterKey.volume = 0.8;
    backgroundMusicAfterKey.play().catch(err => console.log('Phase 2 music failed:', err));
    console.log(`🎵 Level ${levelIndex + 1} Phase 2 music started`);
}

/**
 * Stops phase 2 music
 */
export function stopAfterKeyMusic() {
    if (backgroundMusicAfterKey) {
        backgroundMusicAfterKey.pause();
        backgroundMusicAfterKey.currentTime = 0;
        backgroundMusicAfterKey = null;
    }
}

/**
 * Returns the current background music instance
 */
export function getBackgroundMusic() {
    return backgroundMusic;
}

/**
 * Plays footstep sound with cooldown to prevent constant overlapping
 */
export function playFootstep() {
    if (!footstepSound) {
        footstepSound = new Audio('./assets/sounds/footsteps_sneakers_trainers_leather_large_running_on_hard_ground_road_concrete_etc_97389_zapsplat_foley.mp3');
        footstepSound.volume = 0.99;
    }
    
    const now = Date.now();
    if (footstepCooldown > now) return;
    
    if (footstepSound.paused) {
        footstepSound.currentTime = 0;
        footstepSound.play().catch(err => console.log('Footstep failed:', err));
        footstepCooldown = now + 400;
    }
}

/**
 * Stops the footstep sound immediately
 */
export function stopFootstep() {
    if (footstepSound && !footstepSound.paused) {
        footstepSound.pause();
        footstepSound.currentTime = 0;
    }
}

/**
 * Creates and starts the key crystal ambient sound
 */
export function startKeyCrystalSound() {
    keyCrystalSound = new Audio('./assets/sounds/crystal - screeching-saxophone-horror-screams.wav');
    keyCrystalSound.loop = true;
    keyCrystalSound.volume = 0;
    keyCrystalSound.play().catch(err => console.log('Key sound failed:', err));
}

/**
 * Updates key crystal sound volume based on distance
 */
export function updateKeyCrystalVolume(distance, maxDistance = 20) {
    if (!keyCrystalSound) return;
    const volume = Math.max(0, 1 - (distance / maxDistance));
    keyCrystalSound.volume = volume * 0.3;
}

/**
 * Stops the key crystal sound
 */
export function stopKeyCrystalSound() {
    if (keyCrystalSound) {
        keyCrystalSound.pause();
        keyCrystalSound = null;
    }
}

/**
 * Creates and starts the exit portal ambient sound
 */
export function startExitPortalSound() {
    exitPortalSound = new Audio('./assets/sounds/gate - GO_AWAYY!!_DONT_OPE_.mp3');
    exitPortalSound.loop = true;
    exitPortalSound.volume = 0;
    exitPortalSound.play().catch(err => console.log('Portal sound failed:', err));
}

/**
 * Updates exit portal sound volume based on distance
 */
export function updateExitPortalVolume(distance, maxDistance = 25) {
    if (!exitPortalSound) return;
    const volume = Math.max(0, 1 - (distance / maxDistance));
    exitPortalSound.volume = volume * 0.45;
}

/**
 * Stops exit portal sound
 */
export function stopExitPortalSound() {
    if (exitPortalSound) {
        exitPortalSound.pause();
        exitPortalSound = null;
    }
}

/**
 * Plays level transition (next level page) sound
 */
export function playLevelTransitionSound() {
    stopLevelTransitionSound(); // Stop if already playing
    
    levelTransitionSound = new Audio('./assets/sounds/lizard_roaring_sound_01.wav');
    levelTransitionSound.volume = 0.6;
    levelTransitionSound.play().catch(err => console.log('Transition sound 1 failed:', err));
    console.log('🎵 Level transition sound 1 playing');
    
    levelTransitionSound2 = new Audio('./assets/sounds/ghost-whispers.wav');
    levelTransitionSound2.volume = 0.6;
    levelTransitionSound2.play().catch(err => console.log('Transition sound 2 failed:', err));
    console.log('🎵 Level transition sound 2 playing');
}

/**
 * Stops level transition sound
 */
export function stopLevelTransitionSound() {
    if (levelTransitionSound) {
        levelTransitionSound.pause();
        levelTransitionSound.currentTime = 0;
        levelTransitionSound = null;
    }
    if (levelTransitionSound2) {
        levelTransitionSound2.pause();
        levelTransitionSound2.currentTime = 0;
        levelTransitionSound2 = null;
    }
}

/**
 * Stops all currently playing sounds
 */
export function stopAllSounds() {
    stopBackgroundMusic();
    stopAfterKeyMusic();
    stopFootstep();
    stopKeyCrystalSound();
    stopExitPortalSound();
    stopLevelTransitionSound();
    stopFalseEcho(); // PHASE 2: Also stop false echo
    console.log('🔇 All sounds stopped');
}

// ==========================================
// PHASE 2: FALSE ECHO AUDIO SYSTEM
// ==========================================

/**
 * Activates the false echo system (Level 3 only, after getting crystal)
 */
export function activateFalseEcho() {
    falseEchoActive = true;
    lastEchoTime = Date.now();
    console.log("👻 False echo system ACTIVATED!");
}

/**
 * Deactivates the false echo system
 */
export function deactivateFalseEcho() {
    falseEchoActive = false;
    cancelFalseEcho();
    console.log("✅ False echo system DEACTIVATED");
}

/**
 * Updates the false echo system - call this every frame
 * @param {boolean} isPlayerMoving - True if player is currently moving
 */
export function updateFalseEcho(isPlayerMoving) {
    if (!falseEchoActive) return;

    const now = Date.now();

    // If player is moving, cancel any pending echo
    if (isPlayerMoving) {
        cancelFalseEcho();
        return;
    }

    // Player has stopped moving
    if (!falseEchoTimer) {
        // Check if enough time has passed since last echo (cooldown)
        if (now - lastEchoTime >= FALSE_ECHO_COOLDOWN * 1000) {
            // Start the delay timer
            falseEchoTimer = setTimeout(() => {
                playFalseEcho();
                falseEchoTimer = null;
            }, FALSE_ECHO_DELAY * 1000);
            
            console.log("👻 False echo timer started... waiting", FALSE_ECHO_DELAY, "seconds");
        }
    }
}

/**
 * Plays a random creepy sound from the false echo pool
 */
function playFalseEcho() {
    if (!falseEchoActive) return;

    // Pick a random sound from the pool
    const randomIndex = Math.floor(Math.random() * FALSE_ECHO_SOUNDS.length);
    const soundFile = FALSE_ECHO_SOUNDS[randomIndex];

    // Stop any currently playing echo
    if (currentEchoSound && !currentEchoSound.paused) {
        currentEchoSound.pause();
        currentEchoSound.currentTime = 0;
    }

    // Play the new echo sound
    currentEchoSound = new Audio(soundFile);
    currentEchoSound.volume = 0.4; // Quieter than normal sounds (subtle horror)
    currentEchoSound.play().catch(err => console.log('False echo failed:', err));
    
    lastEchoTime = Date.now();
    console.log("👻 FALSE ECHO PLAYED:", soundFile);
}

/**
 * Cancels any pending false echo timer
 */
function cancelFalseEcho() {
    if (falseEchoTimer) {
        clearTimeout(falseEchoTimer);
        falseEchoTimer = null;
    }
}

/**
 * Stops the false echo system completely
 */
export function stopFalseEcho() {
    cancelFalseEcho();
    
    if (currentEchoSound && !currentEchoSound.paused) {
        currentEchoSound.pause();
        currentEchoSound.currentTime = 0;
        currentEchoSound = null;
    }
    
    falseEchoActive = false;
}

/**
 * Returns whether false echo is currently active
 */
export function isFalseEchoActive() {
    return falseEchoActive;
}