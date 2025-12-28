// --- src/components/entity.js (PHASE 4: THE TRAPPED SOUL) ---
// Handles the Level 3 entity that follows the player

import * as CONSTANTS from '../utils/constants.js';

let entity = null; // The THREE.Sprite object
let entityActive = false;
let entityTimer = CONSTANTS.GAME.ENTITY_TIMER; // 5 seconds
let isPlayerLookingBack = false; // Triggered by 'L' key
let scene = null;
let playerObject = null;
let camera = null; // Store camera reference for view detection

/**
 * Creates and spawns the entity sprite behind the player
 * @param {THREE.Scene} sceneInstance - The main scene
 * @param {THREE.Object3D} player - The player object
 * @param {THREE.Camera} cameraInstance - The camera for view detection
 */
export function spawnEntity(sceneInstance, player, cameraInstance) {
    scene = sceneInstance;
    playerObject = player;
    camera = cameraInstance;
    
    // Load the entity texture
    const textureLoader = new THREE.TextureLoader();
    const entityTexture = textureLoader.load('./assets/images/soul - Terrifying Ghost Apparition _ Haunting Spirit in the Shadows.jfif');
    
    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
        map: entityTexture,
        transparent: true,
        opacity: 0.9,
        depthTest: true,
        depthWrite: false
    });
    
    // Create the sprite
    entity = new THREE.Sprite(spriteMaterial);
    entity.scale.set(4, 6, 1); // Width, Height (adjust for scary size)
    
    // Position entity behind player
    const spawnDistance = CONSTANTS.GAME.ENTITY_DISTANCE; // 15 units behind
    const playerDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(playerObject.quaternion);
    const spawnPosition = playerObject.position.clone().sub(playerDirection.multiplyScalar(spawnDistance));
    
    entity.position.set(spawnPosition.x, CONSTANTS.PLAYER.HEIGHT, spawnPosition.z); // At eye level
    
    scene.add(entity);
    entityActive = true;
    entityTimer = CONSTANTS.GAME.ENTITY_TIMER; // Reset timer to 5 seconds
    
    console.log("👹 ENTITY SPAWNED at position:", entity.position);
}

/**
 * Updates the entity position and timer logic
 * @param {number} deltaTime - Time since last frame
 * @returns {boolean} True if entity killed the player (timer reached 0)
 */
export function updateEntity(deltaTime) {
    if (!entityActive || !entity || !playerObject || !camera) return false;
    
    // --- CHECK IF ENTITY IS IN PLAYER'S VIEW (FLASHLIGHT) ---
    const isEntityInView = checkEntityInView();
    
    // --- 1. Timer Logic ---
    if (isPlayerLookingBack && isEntityInView) {
        // Player is looking back AND entity is in view → Timer resets
        entityTimer = CONSTANTS.GAME.ENTITY_TIMER; // Reset to 5 seconds
        
        // Log only when first caught in view
        if (entityTimer === CONSTANTS.GAME.ENTITY_TIMER) {
            console.log("💡 Entity caught in flashlight! Timer reset!");
        }
    } else {
        // Player NOT looking back OR entity not in view → Timer counts down
        entityTimer -= deltaTime;
        
        if (entityTimer <= 0) {
            // DEATH: Timer reached zero
            console.log("💀 ENTITY KILLED PLAYER! Timer reached 0");
            return true; // Signal death to main.js
        }
    }
    
    // --- 2. Entity Movement Logic ---
    if (isPlayerLookingBack && isEntityInView) {
        // Entity is caught in flashlight → FREEZE (does not move)
        // Do nothing, entity stays frozen
    } else {
        // Entity NOT in view → moves toward player
        const direction = new THREE.Vector3()
            .subVectors(playerObject.position, entity.position)
            .normalize();
        
        const moveDistance = CONSTANTS.GAME.ENTITY_SPEED * deltaTime; // 2 units/second
        
        entity.position.x += direction.x * moveDistance;
        entity.position.z += direction.z * moveDistance;
        
        // Keep entity at eye level
        entity.position.y = CONSTANTS.PLAYER.HEIGHT;
    }
    
    return false; // Player still alive
}

/**
 * Checks if the entity is within the player's view cone (flashlight beam)
 * @returns {boolean} True if entity is visible to player
 */
function checkEntityInView() {
    if (!camera || !entity || !playerObject) return false;
    
    // Get camera's forward direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Get direction from player to entity
    const toEntity = new THREE.Vector3()
        .subVectors(entity.position, playerObject.position)
        .normalize();
    
    // Calculate angle between camera direction and entity direction
    const angle = cameraDirection.angleTo(toEntity);
    
    // Check if entity is within view cone (e.g., 60 degrees = ~1.05 radians)
    // SpotLight angle is Math.PI * 0.15 = 0.47 radians (~27 degrees)
    // We'll use slightly wider cone for gameplay: 0.6 radians (~34 degrees)
    const viewConeAngle = 0.6;
    
    const inView = angle < viewConeAngle;
    
    // Optional: Also check distance for flashlight range
    const distance = playerObject.position.distanceTo(entity.position);
    const maxFlashlightDistance = 50; // Match flashlight distance from lighting.js
    
    return inView && distance <= maxFlashlightDistance;
}

/**
 * Sets whether the player is looking back (L key pressed)
 * @param {boolean} looking - True if L key is pressed
 */
export function setPlayerLookingBack(looking) {
    isPlayerLookingBack = looking;
    
    if (looking) {
        console.log("👁️ Player looking back! Entity frozen, timer reset");
    }
}

/**
 * Returns the current entity timer value
 */
export function getEntityTimer() {
    return entityTimer;
}

/**
 * Returns whether entity is currently active
 */
export function isEntityActive() {
    return entityActive;
}

/**
 * Removes the entity from the scene and deactivates it
 */
export function removeEntity() {
    if (entity && scene) {
        scene.remove(entity);
        entity = null;
    }
    entityActive = false;
    entityTimer = CONSTANTS.GAME.ENTITY_TIMER;
    isPlayerLookingBack = false;
    console.log("✅ Entity removed");
}

/**
 * Returns the entity object (for debugging or distance checks)
 */
export function getEntity() {
    return entity;
}

/**
 * Returns whether player is currently looking back
 */
export function isLookingBack() {
    return isPlayerLookingBack;
}