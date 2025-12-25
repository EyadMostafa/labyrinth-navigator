// --- src/utils/audioManager.js ---
// Handles all game audio (music, footsteps, spatial sounds)

let backgroundMusic = null;
let backgroundMusicAfterKey = null;
let footstepSound = null;
let footstepCooldown = 0; // Cooldown timer for footsteps

/**
 * Initializes and starts background music
 */
export function startBackgroundMusic() {
    backgroundMusic = new Audio('./assets/sounds/spooky-piano-and-vox.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    backgroundMusic.play().catch(err => console.log('Background music failed:', err));
}

/**
 * Stops the current background music
 */
export function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

/**
 * Plays the "after key collected" background music
 */
export function playAfterKeyMusic() {
    stopBackgroundMusic();
    
    backgroundMusicAfterKey = new Audio('./assets/sounds/bugs-bats-and-bells-soundscape.wav');
    backgroundMusicAfterKey.loop = true;
    backgroundMusicAfterKey.volume = 0.8;
    backgroundMusicAfterKey.play().catch(err => console.log('Intense music failed:', err));
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
    
    // Check cooldown to create realistic footstep intervals
    const now = Date.now();
    if (footstepCooldown > now) return;
    
    // Only play if not already playing
    if (footstepSound.paused) {
        footstepSound.currentTime = 0;
        footstepSound.play().catch(err => console.log('Footstep failed:', err));
        footstepCooldown = now + 400; // 400ms between footsteps (adjust for faster/slower walking)
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

let keyCrystalSound = null;

/**
 * Creates and starts the key crystal ambient sound
 */
export function startKeyCrystalSound() {
    keyCrystalSound = new Audio('./assets/sounds/screeching-saxophone-horror-screams.wav');
    keyCrystalSound.loop = true;
    keyCrystalSound.volume = 0;
    keyCrystalSound.play().catch(err => console.log('Key sound failed:', err));
}

/**
 * Updates key crystal sound volume based on distance
 * @param {number} distance - Distance from player to key
 * @param {number} maxDistance - Maximum distance for hearing the sound
 */
export function updateKeyCrystalVolume(distance, maxDistance = 20) {
    if (!keyCrystalSound) return;
    
    // Calculate volume based on distance (inverse relationship)
    const volume = Math.max(0, 1 - (distance / maxDistance));
    keyCrystalSound.volume = volume * 0.3; // Max 50% volume
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

let exitPortalSound = null;

/**
 * Creates and starts the exit portal ambient sound
 */
export function startExitPortalSound() {
    exitPortalSound = new Audio('./assets/sounds/GO_AWAYY!!_DONT_OPE_.mp3');
    exitPortalSound.loop = true;
    exitPortalSound.volume = 0;
    exitPortalSound.play().catch(err => console.log('Portal sound failed:', err));
}

/**
 * Updates exit portal sound volume based on distance
 * @param {number} distance - Distance from player to portal
 * @param {number} maxDistance - Maximum distance for hearing the sound
 */
export function updateExitPortalVolume(distance, maxDistance = 25) {
    if (!exitPortalSound) return;
    
    const volume = Math.max(0, 1 - (distance / maxDistance));
    exitPortalSound.volume = volume * 0.45; // Max 60% volume
}