// --- src/components/player.js (PHASE 4: L KEY + ENTITY FACING) ---
// Handles the player entity, first-person camera, and all user input (WASD, Mouse Look, L key).

import * as CONSTANTS from '../utils/constants.js';
import { playFootstep, stopFootstep } from '../utils/audioManager.js';

let player; // THREE.Object3D container for position and rotation (The invisible player body)
let camera;
let keys = { w: false, a: false, s: false, d: false, e: false, l: false }; // Input state tracker
let isPointerLocked = false;
let playerCollider; // Bounding box representation of the player
const PLAYER_RADIUS = 0.5; // Player's effective width for collision

// Level 3 specific variables
let hasKeyCrystal = false; // Track if player has picked up the crystal
let isLookingBack = false; // Track if player is pressing L key
let originalYRotation = 0; // Store player's original Y rotation before looking back

// --- Public Functions ---

/**
 * Initializes the player entity and attaches the camera and input listeners.
 * @param {THREE.Scene} sceneInstance - The main Three.js scene.
 * @param {THREE.PerspectiveCamera} cameraInstance - The game camera instance.
 * @returns {THREE.Object3D} The player container object.
 */
export function setupPlayer(sceneInstance, cameraInstance) {
    camera = cameraInstance;
    
    // Create the invisible container that represents the player's position and rotation
    player = new THREE.Object3D();
    player.position.set(0, 0, 0); 
    sceneInstance.add(player);

    // Attach the camera to the player object and set the eye level height
    camera.position.set(0, CONSTANTS.PLAYER.HEIGHT, 0); 
    player.add(camera);

    // Create the player's collision boundary (simple sphere for approximation)
    playerCollider = new THREE.Sphere(player.position, PLAYER_RADIUS);

    // Setup input listeners for keyboard and mouse
    setupInputListeners();
    setupPointerLock();
    
    return player;
}

/**
 * Updates the player's position and rotation based on input state.
 * Called every frame by main.js.
 * @param {number} deltaTime - Time elapsed since the last frame.
 * @param {object} gameData - Reference to the main game state.
 * @param {Array<THREE.Box3>} wallColliders - List of bounding boxes for walls.
 */
export function updatePlayer(deltaTime, gameData, wallColliders) {
    if (!gameData.isRunning || !isPointerLocked) return;

    // Update looking back state and handle camera rotation
    const wasLookingBack = isLookingBack;
    isLookingBack = keys.l;
    
    // Handle L key press - rotate 180° to look behind
    if (isLookingBack && !wasLookingBack) {
        // Player just pressed L - turn around
        originalYRotation = player.rotation.y; // Store current rotation
        player.rotation.y += Math.PI; // Rotate 180 degrees
        console.log("👁️ Player turned around to look behind! (L pressed)");
    } else if (!isLookingBack && wasLookingBack) {
        // Player released L - turn back to original direction
        player.rotation.y = originalYRotation; // Restore original rotation
        console.log("👁️ Player turned back forward (L released)");
    }

    // Determine current movement speed based on player state
    let currentSpeed = CONSTANTS.PLAYER.MOVE_SPEED;
    
    // Level 3: Apply speed modifications
    if (hasKeyCrystal) {
        currentSpeed = CONSTANTS.PLAYER.MOVE_SPEED_WITH_KEY; // 60% speed with crystal (3 units/sec)
    }
    
    if (isLookingBack) {
        currentSpeed = CONSTANTS.PLAYER.MOVE_SPEED_FACING_ENTITY; // 30% speed when looking back (1.5 units/sec)
    }

    // Calculate movement distance based on speed and frame time
    const moveDistance = currentSpeed * deltaTime;
    const currentPosition = player.position.clone();
    
    // Temporary variables to calculate the proposed new position
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);
    
    let deltaX = 0;
    let deltaZ = 0;
    
    // Determine movement direction based on keys
    if (keys.w) { deltaZ += moveDistance; } // W: Forward
    if (keys.s) { deltaZ -= moveDistance; } // S: Backward
    if (keys.d) { deltaX += moveDistance; } // D: Right
    if (keys.a) { deltaX -= moveDistance; } // A: Left

    if (deltaX !== 0 || deltaZ !== 0) {
        // Play footstep sound when moving
        playFootstep();
        
        // Calculate proposed movement vector
        const moveVector = forward.multiplyScalar(deltaZ).add(right.multiplyScalar(deltaX));
        
        // --- 1. Attempt movement on the XZ plane (Horizontal) ---
        const proposedPosition = currentPosition.clone().add(moveVector);
        
        // --- 2. Collision Check ---
        if (!checkCollision(proposedPosition, wallColliders)) {
            // No collision detected, apply the position change
            player.position.copy(proposedPosition);
        } else {
            // Collision detected, try moving only along one axis (slide)
            
            // Try X-only movement
            const proposedPositionX = currentPosition.clone().add(forward.multiplyScalar(deltaZ)).add(right.multiplyScalar(deltaX).setZ(0));
            if (!checkCollision(proposedPositionX, wallColliders)) {
                player.position.copy(proposedPositionX);
            } 
            // Try Z-only movement
            else {
                const proposedPositionZ = currentPosition.clone().add(forward.multiplyScalar(deltaZ).setX(0)).add(right.multiplyScalar(deltaX));
                if (!checkCollision(proposedPositionZ, wallColliders)) {
                    player.position.copy(proposedPositionZ);
                }
            }
        }
    } else {
        // Stop footstep sound when not moving
        stopFootstep();
    }
    
    // Lock player height to ground level (Y-coordinate is fixed at 0)
    player.position.y = 0; 
    // Update player's collision sphere position
    playerCollider.center.copy(player.position);
}


// --- Private Functions: Collision Detection ---

/**
 * Checks if the proposed player position collides with any wall collider.
 * Uses simplified AABB-Sphere check (since player is treated as a sphere collider).
 * @param {THREE.Vector3} proposedPosition - The location the player wants to move to.
 * @param {Array<THREE.Box3>} colliders - List of wall bounding boxes.
 * @returns {boolean} True if a collision occurs.
 */
function checkCollision(proposedPosition, colliders) {
    const tempSphere = new THREE.Sphere(proposedPosition, PLAYER_RADIUS);
    
    for (const box of colliders) {
        // Check if the player's sphere intersects the wall's bounding box
        if (box.intersectsSphere(tempSphere)) {
            return true;
        }
    }
    return false;
}


// --- Private Functions: Input Handling ---
function setupInputListeners() {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
}

function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key] = true;
        
        // DEBUG: Log L key press
        if (key === 'l') {
            console.log("🔑 L key pressed! Looking back...");
        }
    }
}

function onKeyUp(event) {
    const key = event.key.toLowerCase();
    if (key in keys) {
        keys[key] = false;
        
        // DEBUG: Log L key release
        if (key === 'l') {
            console.log("🔑 L key released! Looking forward...");
        }
    }
}

function setupPointerLock() {
    const element = document.body;
    element.addEventListener('click', () => {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    }, false);

    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', onPointerLockChange, false);
    document.addEventListener('webkitpointerlockchange', onPointerLockChange, false);
    document.addEventListener('mousemove', onMouseMove, false);
}

function onPointerLockChange() {
    if (document.pointerLockElement === document.body ||
        document.mozPointerLockElement === document.body ||
        document.webkitPointerLockElement === document.body) {
        isPointerLocked = true;
        console.log("Pointer Lock Activated.");
    } else {
        isPointerLocked = false;
        console.log("Pointer Lock Deactivated.");
    }
}

function onMouseMove(event) {
    if (!isPointerLocked) return;
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    
    player.rotation.y -= movementX * CONSTANTS.PLAYER.ROTATION_SPEED;
    let newPitch = camera.rotation.x - movementY * CONSTANTS.PLAYER.ROTATION_SPEED;
    newPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newPitch));
    camera.rotation.x = newPitch;
}


// --- Public Accessors and Mutators ---
export function getPlayerObject() { return player; }
export function getPlayerKeys() { return keys; }
export function setPlayerPosition(x, z) { player.position.set(x, 0, z); }
export function getPlayerRadius() { return PLAYER_RADIUS; }
export function getCamera() { return camera; }

// Level 3 specific functions
export function setHasKeyCrystal(value) { 
    hasKeyCrystal = value; 
    console.log("💎 Player has crystal:", hasKeyCrystal);
}

export function isPlayerMoving() {
    return keys.w || keys.a || keys.s || keys.d;
}

/**
 * Returns true if any movement key is currently pressed
 */
export function getMovementState() {
    return {
        moving: keys.w || keys.a || keys.s || keys.d,
        forward: keys.w,
        backward: keys.s,
        left: keys.a,
        right: keys.d
    };
}

/**
 * Returns whether player is currently looking back (L key pressed)
 */
export function isPlayerLookingBack() {
    return isLookingBack;
}