// --- src/components/maze.js ---
// Handles maze geometry generation, object placement, and scene animations.

import * as CONSTANTS from '../utils/constants.js';
import { setPlayerPosition } from './player.js'; 

let scene;
let wallColliders = []; // Array of THREE.Box3 objects for collision
let keyCrystal;
let exitPortal;
let objectsToAnimate = [];
let textureLoader = new THREE.TextureLoader();
const tempBox = new THREE.Box3(); // Reusable temporary Box3 object

// --- Public Functions ---

/**
 * Creates the maze structure based on the LEVEL_DATA and places all objects.
 * @param {THREE.Scene} sceneInstance - The main scene object.
 * @returns {object} References to interactive objects (key, exit).
 */
export function createMaze(sceneInstance) {
    scene = sceneInstance;
    wallColliders = []; // Reset list

    // Load a simple repeating texture for the walls (Requirement D)
    const wallTexture = textureLoader.load('https://placehold.co/100x100/444444/333333?text=BRICK');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 1);

    const wallMaterial = new THREE.MeshPhongMaterial({ 
        map: wallTexture, 
        color: CONSTANTS.COLOR.WALL,
        shininess: 10
    });
    
    // Floor Material
    const floorMaterial = new THREE.MeshPhongMaterial({
        color: CONSTANTS.COLOR.FLOOR,
        side: THREE.DoubleSide
    });


    // --- 1. Grid Iteration and Object Placement (Requirement A) ---
    const data = CONSTANTS.MAZE.LEVEL_DATA;
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

    return exitPortal;
}

function createMovingObstacle(x, z, size, height, width) {
    const geometry = new THREE.BoxGeometry(width * 2, height, size * 0.8);
    const material = new THREE.MeshPhongMaterial({ color: 0xaa0000, shininess: 5 }); 

    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(x, height / 2, z);
    obstacle.castShadow = true;
    obstacle.isMovingObstacle = true;

    obstacle.initialPositionZ = z;
    
    scene.add(obstacle);
    return obstacle;
}