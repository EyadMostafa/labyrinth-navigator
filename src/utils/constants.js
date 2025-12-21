// --- src/utils/constants.js ---
// Centralized configuration for the Labyrinth Navigator game.

// Note on MAZE.LEVEL_DATA:
// W = Wall (Solid barrier)
// S = Start Position (Player spawn)
// K = Key Crystal spawn
// E = Exit Portal spawn
// M = Moving Obstacle spawn (will be placed on the floor path)
// . = Empty Path

export const MAZE = {
    // Grid definition
    GRID_UNIT: 5,           // The size of one unit square in the maze (in Three.js units)
    WALL_HEIGHT: 3,         // Height of the walls
    WALL_THICKNESS: 0.5,    // Thickness of the walls (Z and X dimensions)
    PLAYER_OFFSET_Y: 0.5,   // Y offset for moving objects to sit on the floor

    // Hard-coded Maze Layout (10x10 grid) - Defining the 3D World (Requirement A)
    LEVEL_DATA: [
        "WWWWWWWWWW",
        "W.W..W.W.W",
        "W.W.MW.K.W",
        "W...WW.W.W",
        "WWWW.W.W.W",
        "W.S..W...W",
        "W.W.WW.WWW",
        "W.W.W..E.W",
        "W...WWWW.W",
        "WWWWWWWWWW"
    ],
};

export const GAME = {
    TIME_LIMIT: 60,         // Time limit in seconds (Requirement G)
    WIN_OBJECTIVE: 1,       // Number of keys required
    COLLECTION_DISTANCE: 3, // *** INCREASED for easier collection (was 2) ***
    UI_TIMER_ELEMENT: 'time-display',
    UI_STATUS_ELEMENT: 'status-display',
    UI_INSTRUCTION_ELEMENT: 'instruction-display',
};

export const PLAYER = {
    MOVE_SPEED: 5,          // Player movement speed (units per second) (Requirement E)
    ROTATION_SPEED: 0.002,  // Mouse rotation sensitivity multiplier (Requirement E)
    HEIGHT: 1.8,            // Camera height above the ground (eye level)
};

export const ANIMATION = {
    KEY_ROTATION_SPEED: 1,     // Key rotation speed (radians per second)
    OBSTACLE_MOVE_SPEED: 1.5,  // Speed of the moving wall obstacle
    OBSTACLE_MAX_OFFSET: 3,    // Maximum distance the obstacle moves from its origin
};

// Hexadecimal colors for visual elements (Requirement D)
export const COLOR = {
    BACKGROUND: 0x050505,       
    WALL: 0x444444,             
    FLOOR: 0x222222,            
    KEY_EMISSIVE: 0x00ff00,     
    EXIT_EMISSIVE: 0xdd5500,    
    WIN_GLOW: 0x00ffff,         
    FLASHLIGHT: 0xffffff,       
};