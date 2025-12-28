// --- src/graphics/lighting.js (ENHANCED FOR LEVEL 3 - INTENSE BREATHING) ---
import * as CONSTANTS from '../utils/constants.js';

let flashlight; // Store reference to the flashlight for breathing effect
let isBreathingActive = false; // Track if breathing effect is enabled
const BREATHING_BASE_INTENSITY = 2.5;
const BREATHING_BASE_DISTANCE = 50;
const BREATHING_VARIATION = 1.5; // INCREASED from 0.8 to 1.5 for MORE visible pulsing
const BREATHING_SPEED = 2.5; // INCREASED from 2.0 to 2.5 for faster, more anxious breathing

/**
 * Sets up all scene lighting, including the player's flashlight. (Requirement C)
 * @param {THREE.Scene} sceneInstance - The main Three.js scene.
 * @param {THREE.Camera} cameraInstance - The camera, to attach the flashlight to.
 */
export function setupLighting(sceneInstance, cameraInstance) {
    // 1. Ambient Light (Low intensity, just to prevent pure blackness)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
    sceneInstance.add(ambientLight);
    
    // 2. Player Flashlight (SpotLight attached to the camera)
    flashlight = new THREE.SpotLight(
        CONSTANTS.COLOR.FLASHLIGHT, 
        BREATHING_BASE_INTENSITY, // Intensity (will be animated in Level 3)
        BREATHING_BASE_DISTANCE,  // Distance (will be animated in Level 3)
        Math.PI * 0.15, // Angle
        0.5, // Penumbra
        2   // Decay
    );
    flashlight.position.set(0, 0, 0); // Position is (0,0,0) relative to the camera
    flashlight.target.position.set(0, 0, -1); // Target is 1 unit directly in front of the camera
    
    // Enable shadows for the flashlight (Crucial for Requirement C)
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.width = 1024;
    flashlight.shadow.mapSize.height = 1024;
    flashlight.shadow.camera.near = 0.5;
    flashlight.shadow.camera.far = 10; // Only cast shadows close to the player
    
    // Attach the light and its target to the camera, so they move together
    cameraInstance.add(flashlight);
    cameraInstance.add(flashlight.target);
    
    // Helper: Add a simple point light at the exit to guide the player
    const exitGlow = new THREE.PointLight(CONSTANTS.COLOR.EXIT_EMISSIVE, 5, 20);
    sceneInstance.add(exitGlow); 
}

/**
 * Activates the breathing light effect for Level 3
 */
export function activateBreathingLight() {
    isBreathingActive = true;
    console.log("💀 INTENSE breathing light effect activated!");
}

/**
 * Deactivates the breathing light effect
 */
export function deactivateBreathingLight() {
    isBreathingActive = false;
    if (flashlight) {
        flashlight.intensity = BREATHING_BASE_INTENSITY;
        flashlight.distance = BREATHING_BASE_DISTANCE;
    }
    console.log("✅ Breathing light effect deactivated");
}

/**
 * Updates the flashlight intensity with breathing effect (call in animate loop)
 * @param {number} elapsedTime - Total elapsed time since game start
 */
export function updateBreathingLight(elapsedTime) {
    if (!isBreathingActive || !flashlight) return;
    
    // Create a "heartbeat" rhythm using sine wave
    const breathCycle = Math.sin(elapsedTime * BREATHING_SPEED);
    
    // Pulse intensity between (base - variation) and (base + variation)
    // With variation = 1.5, intensity ranges from 1.0 to 4.0 (much more dramatic!)
    flashlight.intensity = BREATHING_BASE_INTENSITY + (breathCycle * BREATHING_VARIATION);
    
    // Also pulse the distance more dramatically for extra effect
    flashlight.distance = BREATHING_BASE_DISTANCE + (breathCycle * 10); // Increased from 5 to 10
}

/**
 * Returns whether breathing effect is currently active
 */
export function isBreathingLightActive() {
    return isBreathingActive;
}