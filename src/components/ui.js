// --- src/components/ui.js (PHASE 4: ENTITY TIMER UI) ---
// Handles all HTML overlay updates, including the timer and game status.

import * as CONSTANTS from '../utils/constants.js';

// DOM Element references
let timeElement;
let statusElement;
let instructionElement;
let entityTimerElement; // PHASE 4: Entity timer display

/**
 * Initializes UI module and gets references to DOM elements.
 */
export function initUI() {
    timeElement = document.getElementById(CONSTANTS.GAME.UI_TIMER_ELEMENT);
    statusElement = document.getElementById(CONSTANTS.GAME.UI_STATUS_ELEMENT);
    instructionElement = document.getElementById(CONSTANTS.GAME.UI_INSTRUCTION_ELEMENT);
    entityTimerElement = document.getElementById('entity-timer-display'); // PHASE 4
    
    // Set initial instruction
    if (instructionElement) {
        instructionElement.textContent = "Click to Look | WASD to Move | Find the Key (Green)";
    }
    
    // Hide entity timer initially
    if (entityTimerElement) {
        entityTimerElement.classList.add('hidden');
    }
    
    // DEBUG: Verify transition screen exists
    const transitionScreen = document.getElementById('level-transition-screen');
    if (transitionScreen) {
        console.log("✅ Level transition screen found in DOM");
    } else {
        console.error("❌ Level transition screen NOT found in DOM!");
    }
}

/**
 * Updates the game UI every frame based on the current game data. (Requirement G)
 * @param {object} gameData - The global game state object.
 */
export function updateUI(gameData) {
    if (!timeElement || !statusElement) {
        // Stop if elements haven't loaded yet
        return;
    }

    // --- Update Timer ---
    if (gameData.isRunning) {
        const timeDisplay = gameData.timer.toFixed(1);
        timeElement.textContent = `TIME: ${timeDisplay}`;
    }

    // --- Update Status / Messages ---
    if (gameData.winState) {
        statusElement.textContent = "STATUS: ESCAPED! (WIN)";
        instructionElement.textContent = "Congratulations! You completed the Labyrinth.";
        timeElement.style.color = CONSTANTS.COLOR.WIN_GLOW;

    } else if (!gameData.isRunning && gameData.timer <= 0) {
        statusElement.textContent = "STATUS: TIME OUT (LOSS)";
        instructionElement.textContent = "Time's up! Refresh to try again.";
        timeElement.style.color = '#ff4444'; // Red for loss

    } else {
        // Game running status
        if (gameData.keyCollected) {
            statusElement.textContent = "KEY STATUS: Acquired (Find the Exit!)";
            statusElement.style.color = CONSTANTS.COLOR.WIN_GLOW;
        } else {
            statusElement.textContent = "KEY STATUS: Missing";
            statusElement.style.color = 'white';
        }
    }
}

/**
 * PHASE 4: Shows the entity timer UI element
 */
export function showEntityTimer() {
    if (entityTimerElement) {
        entityTimerElement.classList.remove('hidden');
        console.log("👹 Entity timer UI shown");
    }
}

/**
 * PHASE 4: Hides the entity timer UI element
 */
export function hideEntityTimer() {
    if (entityTimerElement) {
        entityTimerElement.classList.add('hidden');
        console.log("✅ Entity timer UI hidden");
    }
}

/**
 * PHASE 4: Updates the entity timer display
 * @param {number} timer - Current entity timer value
 */
export function updateEntityTimer(timer) {
    if (!entityTimerElement) return;
    
    const timerDisplay = timer.toFixed(1);
    entityTimerElement.textContent = `ENTITY: ${timerDisplay}s`;
    
    // Color changes based on urgency
    if (timer <= 1.0) {
        entityTimerElement.style.color = '#ff0000'; // Red - CRITICAL
        entityTimerElement.style.textShadow = '0 0 10px #ff0000';
    } else if (timer <= 2.5) {
        entityTimerElement.style.color = '#ff6600'; // Orange - Warning
        entityTimerElement.style.textShadow = '0 0 10px #ff6600';
    } else {
        entityTimerElement.style.color = '#ffff00'; // Yellow - Safe
        entityTimerElement.style.textShadow = '0 0 10px #ffff00';
    }
}

/**
 * Shows the game over screen with win/loss message
 * @param {boolean} didWin - True if player won, false if lost
 */
export function showGameOverScreen(didWin) {
    const screen = document.getElementById('game-over-screen');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const message2 = document.getElementById('result-message2');

    if (!screen) {
        console.error("❌ Game over screen not found!");
        return;
    }

    // Create and play sound
    const sound = new Audio(didWin ? './assets/sounds/lizard_roaring_sound_01.wav' : './assets/sounds/horror-scream-1.wav');
    sound.volume = 0.6;
    sound.play().catch(err => console.log('Audio play failed:', err));
    
    // Set background based on win/loss
    if (didWin) {
        // Win: Custom background image
        screen.style.backgroundImage = "url('./assets/images/final win screen.jfif')";
        screen.style.backgroundSize = 'cover';
        screen.style.backgroundPosition = "center 21%";
        
        // --- UPDATED TEXT FOR FINAL VICTORY ---
        title.textContent = "CONGRATULATIONS!";
        title.style.color = "#00ffff"; // Cyan color
        
        message.textContent = "You have conquered the Labyrinth and found the way out!";
        message2.textContent = "The darkness recedes... for now.";
        message2.style.color = "#00ff00"; // Green color for success
    } else {
        // Loss: Dark red gradient
        screen.style.backgroundImage = "url('./assets/images/bloody horror background.jfif')";
        screen.style.backgroundSize = 'cover';
        
        title.textContent = "TIME'S UP!";
        title.style.color = "#ff4444";
        message.textContent = "You failed to escape in time.";
        message2.textContent = "The Labyrinth has claimed a new resident.";
        message2.style.color = "#820303";
    }
    
    // Show the screen
    screen.classList.remove('hidden');
    console.log("✅ Game over screen displayed");
    
    // Setup restart button
    document.getElementById('restart-btn').onclick = () => {
        location.reload();
    };
}

/**
 * PHASE 4: Shows the entity death screen with jumpscare video
 */
export function showEntityDeathScreen() {
    const screen = document.getElementById('entity-death-screen');
    const video = document.getElementById('entity-death-video');
    
    if (!screen || !video) {
        console.error("❌ Entity death screen or video not found!");
        return;
    }
    
    // Show the screen
    screen.classList.remove('hidden');
    
    // Play the jumpscare video
    video.currentTime = 0;
    video.play().catch(err => console.log('Video play failed:', err));
    
    console.log("💀 Entity death screen displayed with jumpscare video");
    
    // After video ends, show loss screen
    video.onended = () => {
        screen.classList.add('hidden');
        showGameOverScreen(false); // Show loss screen
    };
}

/**
 * Shows the level transition screen when player completes a level
 * @param {number} completedLevel - The level number just completed (0-indexed)
 * @param {number} timeRemaining - Time left on the clock
 * @returns {HTMLElement} The continue button element
 */
export function showLevelTransition(completedLevel, timeRemaining) {
    console.log("🎬 showLevelTransition() called with level:", completedLevel, "time:", timeRemaining);
    
    const screen = document.getElementById('level-transition-screen');
    const background = document.getElementById('transition-background');
    const completedText = document.getElementById('completed-level-text');
    const nextLevelText = document.getElementById('next-level-text');
    const timeDisplay = document.getElementById('time-remaining');
    const continueBtn = document.getElementById('continue-btn');
    
    // DEBUG: Check if all elements exist
    console.log("🔍 Elements found:", {
        screen: !!screen,
        background: !!background,
        completedText: !!completedText,
        nextLevelText: !!nextLevelText,
        timeDisplay: !!timeDisplay,
        continueBtn: !!continueBtn
    });
    
    if (!screen) {
        console.error('❌ Level transition screen not found!');
        return null;
    }
    
    // Set level-specific background image
    const backgrounds = [
        './assets/images/dungeon gate.jpg',  // After Level 1 (index 0)
        './assets/images/dungeon gate.jpg',  // After Level 2 (index 1)
    ];
    
    if (background && backgrounds[completedLevel]) {
        background.style.backgroundImage = `url('${backgrounds[completedLevel]}')`;
        console.log("🖼️ Background set to:", backgrounds[completedLevel]);
    }
    
    // Update text
    if (completedText) {
        completedText.textContent = `Level ${completedLevel + 1} Conquered!`;
        console.log("✏️ Completed text set:", completedText.textContent);
    }
    
    const levelNames = ["Shadow Passage", "The Haunted Halls", "Trapped Soul"];
    if (nextLevelText) {
        nextLevelText.textContent = `Level ${completedLevel + 2}: ${levelNames[completedLevel + 1] || 'Unknown'}`;
        console.log("✏️ Next level text set:", nextLevelText.textContent);
    }
    
    if (timeDisplay) {
        timeDisplay.textContent = `${timeRemaining.toFixed(1)}s`;
        console.log("⏱️ Time display set:", timeDisplay.textContent);
    }
    
    // Show the screen
    screen.classList.remove('hidden');
    console.log("✅ Level transition screen should now be visible");
    console.log("🔍 Screen classes after removal:", screen.className);
    
    if (!continueBtn) {
        console.error("❌ Continue button not found!");
    } else {
        console.log("✅ Continue button found and will be returned");
    }
    
    return continueBtn;
}