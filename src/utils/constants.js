// --- src/utils/constants.js (ENHANCED FOR LEVEL 3 - ADJUSTED VALUES) ---
// Centralized configuration for the Labyrinth Navigator game.
// Note on MAZE.LEVEL_DATA:
// W = Wall (Solid barrier)
// S = Start Position (Player spawn)
// K = Key Crystal spawn
// E = Exit Portal spawn
// M = Moving Obstacle spawn (will be placed on the floor path)
// . = Empty Path

export const MAZE = {
    GRID_UNIT: 5,
    WALL_HEIGHT: 6,
    WALL_THICKNESS: 2,
    // Instead of one "LEVEL_DATA", we now have a list called "LEVELS"
    LEVELS: [
        // --- LEVEL 1 (Index 0) ---
        [
            'WWWWWWWWWWWWWW',
            'W            W',
            'W  S      K  W',
            'W     WW     W',
            'W  M  WW  E  W',
            'W            W',
            'WWWWWWWWWWWWWW'
        ],
        // --- LEVEL 2 (Index 1) ---
        [
            'WWWWWWWWWWWWWWWWWWWWW',
            'W S W       W K     W',
            'W   W WWW W W W WWW W',
            'W     W   W   W W   W',
            'WWWWWWW W WWWWWWW W W',
            'W       W    M    W W',
            'W WWWWWWWWWWWWWWWWW W',
            'W                   W',
            'WWWWWWWWWWWWWWWWWWW W',
            'W         E         W',
            'WWWWWWWWWWWWWWWWWWWWW'
        ],
        // --- LEVEL 3 (Index 2) - THE HORROR LEVEL ---
        [
            'WWWWWWWWWWWWWWWWWWWWWWWWW',
            'W S                     W',
            'W   WWWWWWWWW   WWWWW   W',
            'W   W       W   W   W   W',
            'W   W   K   W   W   W   W',
            'W   W       W       W   W',
            'W   WWWWW   WWWWWWWWW   W',
            'W       W       M       W',
            'WWWWW   W   WWWWWWWWW   W',
            'W       W           W   W',
            'W   WWWWWWWWW   W   W   W',
            'W               W       W',
            'W   WWWWWWWWWWWWWWWWW   W',
            'W   W               W   W',
            'W   W   WWWWWWWWW   W   W',
            'W       W       W       W',
            'WWWWW   W   E   W   WWWWW',
            'W       W       W       W',
            'W   WWWWWWWWWWWWWWWWW   W',
            'W                       W',
            'WWWWWWWWWWWWWWWWWWWWWWWWW'
        ],
    ],
    LEVEL_NAMES: [
        "Shadow Passage",
        "The Haunted Halls",
        "Trapped Soul",
    ]
};

export const GAME = {
    TIME_LIMIT: 60,         // Time limit for Level 1 & 2 (seconds)
    TIME_LIMIT_LEVEL3: 120, // INCREASED: Level 3 gets 120 seconds (2 minutes)
    WIN_OBJECTIVE: 1,       // Number of keys required
    COLLECTION_DISTANCE: 3, // Collection radius
    UI_TIMER_ELEMENT: 'time-display',
    UI_STATUS_ELEMENT: 'status-display',
    UI_INSTRUCTION_ELEMENT: 'instruction-display',
    
    // Level 3 specific settings
    ENTITY_TIMER: 5,        // How long until entity kills player (5 seconds)
    ENTITY_DISTANCE: 15,    // Starting distance behind player
    ENTITY_SPEED: 2,        // How fast entity moves toward player (units/second)
};

export const PLAYER = {
    MOVE_SPEED: 5,          // Base player movement speed (units per second)
    MOVE_SPEED_WITH_KEY: 3, // DECREASED from 4 to 3 (60% speed when holding crystal - 5 * 0.6 = 3)
    MOVE_SPEED_FACING_ENTITY: 1.5, // 30% speed when facing entity (5 * 0.3 = 1.5)
    ROTATION_SPEED: 0.002,  // Mouse rotation sensitivity multiplier
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

// Level 3 Audio Settings
export const LEVEL3_AUDIO = {
    FALSE_ECHO_DELAY: 0.5,      // Delay before playing echo sound (seconds)
    FALSE_ECHO_COOLDOWN: 3.0,   // Minimum time between echo sounds (seconds)
    FALSE_ECHO_SOUNDS: [
        './assets/sounds/footsteps_sneakers_trainers_leather_large_running_on_hard_ground_road_concrete_etc_97389_zapsplat_foley.mp3',
        './assets/sounds/crystal - screeching-saxophone-horror-screams.wav',
        './assets/sounds/ghost-whispers.wav',
    ]
};