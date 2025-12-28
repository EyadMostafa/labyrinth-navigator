// --- src/components/maze.js (WITH STARTING LEVEL SUPPORT) ---
// Handles maze geometry generation, object placement, and scene animations.

import * as CONSTANTS from '../utils/constants.js';
import { setPlayerPosition } from './player.js'; 

let scene;
let wallColliders = []; // Array of THREE.Box3 objects for collision
let keyCrystal;
let exitPortal;
let levelObjects = [];
let objectsToAnimate = [];
let textureLoader = new THREE.TextureLoader();
const tempBox = new THREE.Box3(); // Reusable temporary Box3 object
let currentLevelIndex = 0;

// --- Public Functions ---

/**
 * Sets the starting level index (called from main.js when game starts)
 * @param {number} levelIndex - The level to start from (0, 1, or 2)
 */
export function setStartingLevel(levelIndex) {
    if (levelIndex >= 0 && levelIndex < CONSTANTS.MAZE.LEVELS.length) {
        currentLevelIndex = levelIndex;
        console.log("🎯 Starting level set to:", currentLevelIndex);
    } else {
        console.warn("⚠️ Invalid level index:", levelIndex, "- defaulting to 0");
        currentLevelIndex = 0;
    }
}

/**
 * Creates the maze structure based on the LEVEL_DATA and places all objects.
 * @param {THREE.Scene} sceneInstance - The main scene object.
 * @returns {object} References to interactive objects (key, exit).
 */
export function createMaze(sceneInstance) {
    scene = sceneInstance;
    clearLevel();
    wallColliders = []; // Reset list

    // Load a simple repeating texture for the walls (Requirement D)
    const wallTexture = textureLoader.load('https://img.pikbest.com/wp/202344/brick-wall-texture-background-of-textured-in-chocolate-brown-shade_9933294.jpg!w700wp');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 1);

    const wallMaterial = new THREE.MeshPhongMaterial({ 
        map: wallTexture, 
        color: CONSTANTS.COLOR.WALL,
        shininess: 10
    });
    
    // Floor Material
    // --- Floor Texture Setup ---
    // 1. Load the image (Use relative path!)
    const floorTexture = textureLoader.load('./assets/images/floor_texture.jpg');

    // 2. Make it tile (Repeat) so it isn't blurry
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    
    // 3. How many times to repeat? 
    // (e.g., 10x10 tiles. Increase this number if the floor looks too huge)
    floorTexture.repeat.set(8, 8); 

    // 4. Update the Material
    const floorMaterial = new THREE.MeshPhongMaterial({
        map: floorTexture,        // Apply the image
        side: THREE.DoubleSide
        // Note: You can add 'color: 0xffffff' to tint it, or remove color to see raw image
    });


    // --- 1. Grid Iteration and Object Placement (Requirement A) ---
    // NEW WAY: Check if we ran out of levels, loop back to start if needed
    if (currentLevelIndex >= CONSTANTS.MAZE.LEVELS.length) {
        currentLevelIndex = 0;
    }

    // Load the correct level based on the index
    const data = CONSTANTS.MAZE.LEVELS[currentLevelIndex];
    const size = CONSTANTS.MAZE.GRID_UNIT;
    const height = CONSTANTS.MAZE.WALL_HEIGHT;
    const width = CONSTANTS.MAZE.WALL_THICKNESS;

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            const char = data[i][j];
            
            // Calculate world position based on grid index
            const x = j * size - (data[i].length * size / 2) + (size / 2);
            const z = i * size - (data.length * size / 2) + (size / 2);

            if (char === 'W') {
                createWall(x, z, size, height, width, wallMaterial);
            } else if (char === 'S') {
                setPlayerPosition(x, z); // Set player spawn position
            } else if (char === 'K') {
                keyCrystal = createKeyCrystal(x, z);
            } else if (char === 'E') {
                exitPortal = createExitPortal(x, z);
            } else if (char === 'M') {
                const obstacle = createMovingObstacle(x, z, size, height, width);
                objectsToAnimate.push(obstacle);
                
                const collider = tempBox.setFromObject(obstacle).clone();
                obstacle.collider = collider; 
                wallColliders.push(collider); 
            }
        }
    }
    
    // --- 2. Create Floor (Requirement A) ---
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(data.length * size, data.length * size),
        floorMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true; 
    scene.add(floor);
    levelObjects.push(floor);

    return { keyCrystal, exitPortal };
}

/**
 * Updates the position/rotation of animated objects in the maze. (Requirement F)
 * @param {number} deltaTime - Time elapsed since the last frame.
 * @param {number} elapsedTime - Total time the game has been running.
 */
export function updateAnimations(deltaTime, elapsedTime) {
    if (!objectsToAnimate.length) return;

    for (const object of objectsToAnimate) {
        if (object.isKey) {
            object.rotation.y += CONSTANTS.ANIMATION.KEY_ROTATION_SPEED * deltaTime;
        } 
        
        if (object.isMovingObstacle) {
            // F. Animation: Oscillating translation (Requirement F)
            const offset = Math.sin(elapsedTime * CONSTANTS.ANIMATION.OBSTACLE_MOVE_SPEED) * CONSTANTS.ANIMATION.OBSTACLE_MAX_OFFSET;
            object.position.z = object.initialPositionZ + offset;

            // Update the stored collision bounding box
            object.updateWorldMatrix(true, false);
            if (object.collider) {
                object.collider.setFromObject(object);
            }
        }
    }
}
/**
 * Switches to the next level index and rebuilds the maze.
 */
export function nextLevel() {
    // 1. Increment the level counter
    currentLevelIndex++;
    
    // 2. Re-run createMaze to build the new level
    // (createMaze will handle clearing the old walls automatically 
    // IF you updated it to use the new "clearLevel" logic I sent before)
    return createMaze(scene);
}
/**
 * Removes the key crystal from the scene and stops its animation.
 */
export function removeKeyCrystal() {
    if (keyCrystal) {
        scene.remove(keyCrystal);
        // Remove from animation queue
        objectsToAnimate = objectsToAnimate.filter(obj => obj !== keyCrystal);
        keyCrystal = null; // Mark as null/gone
    }
}


// --- Public Accessors ---

export function getKeyCrystal() { return keyCrystal; }
export function getExitPortal() { return exitPortal; }

/** Returns the list of all static and moving wall collision bounding boxes. */
export function getWallColliders() {
    return wallColliders;
}

export function getCurrentLevelIndex() {
    return currentLevelIndex;
}

// --- Private Helper Functions ---

function createWall(x, z, size, height, width, material) {
    const isXWall = (Math.random() > 0.5); 
    
    const geometry = new THREE.BoxGeometry(
        isXWall ? width : size, 
        height, 
        isXWall ? size : width
    );
    
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, height / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    
    scene.add(wall);
    
    levelObjects.push(wall);
    // Generate and store the collision bounding box (AABB)
    wallColliders.push(tempBox.setFromObject(wall).clone());
}

function createKeyCrystal(x, z) {
    const geometry = new THREE.DodecahedronGeometry(CONSTANTS.MAZE.GRID_UNIT * 0.2); 
    const material = new THREE.MeshPhongMaterial({
        color: CONSTANTS.COLOR.KEY_EMISSIVE,
        emissive: CONSTANTS.COLOR.KEY_EMISSIVE,
        emissiveIntensity: 0.8,
        shininess: 100 
    });

    keyCrystal = new THREE.Mesh(geometry, material);
    keyCrystal.position.set(x, CONSTANTS.MAZE.WALL_HEIGHT / 2, z);
    keyCrystal.isKey = true; 
    keyCrystal.castShadow = true;
    scene.add(keyCrystal);
    levelObjects.push(keyCrystal);
    objectsToAnimate.push(keyCrystal);

    return keyCrystal;
}

function createExitPortal(x, z) {
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16); 
    const material = new THREE.MeshPhongMaterial({
        color: CONSTANTS.COLOR.EXIT_EMISSIVE,
        emissive: CONSTANTS.COLOR.EXIT_EMISSIVE,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8
    });

    exitPortal = new THREE.Mesh(geometry, material);
    exitPortal.position.set(x, CONSTANTS.MAZE.WALL_HEIGHT / 2, z);
    exitPortal.isExit = true;
    scene.add(exitPortal);
    levelObjects.push(exitPortal);

    return exitPortal;
}

function createMovingObstacle(x, z, size, height, width) {
    const geometry = new THREE.BoxGeometry(width * 2, height, size * 0.8);
    const material = new THREE.MeshPhongMaterial({ color: 0xaa0000, shininess: 5 }); 

    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(x, height / 2, z);
    obstacle.castShadow = true;
    obstacle.isMovingObstacle = true;
    levelObjects.push(obstacle);

    obstacle.initialPositionZ = z;
    
    scene.add(obstacle);
    return obstacle;
}

function clearLevel() {
    // Remove every object created for this level
    for (const obj of levelObjects) {
        scene.remove(obj);
    }
    // Reset arrays
    levelObjects = []; 
    wallColliders = [];
    objectsToAnimate = [];
    keyCrystal = null;
    exitPortal = null;
}