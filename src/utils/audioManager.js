// --- src/utils/audioManager.js (FIXED) ---
// Handles all game audio (music, footsteps, spatial sounds)

let backgroundMusic = null;
let backgroundMusicAfterKey = null;
let footstepSound = null;
let footstepCooldown = 0;
let keyCrystalSound = null;
let exitPortalSound = null;
let levelTransitionSound = null; // For next level page
let levelTransitionSound2 = null; // FIXED: Added missing variable

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
    
    // FIXED: Now properly declared at the top
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
    // FIXED: Also stop the second sound
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
    console.log('🔇 All sounds stopped');
}