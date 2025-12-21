
import * as CONSTANTS from '../utils/constants.js';

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
    const flashlight = new THREE.SpotLight(
        CONSTANTS.COLOR.FLASHLIGHT, 
        2.5, // Intensity
        50,  // Distance
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
    // Position will be set later by maze.js or we rely on the emissive material
    sceneInstance.add(exitGlow); 
    // Note: We skip complex positioning here and rely mainly on the SpotLight and Emissive materials.
}