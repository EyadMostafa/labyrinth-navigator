// --- src/components/ui.js ---
// Handles all HTML overlay updates, including the timer and game status.

import * as CONSTANTS from '../utils/constants.js';

// DOM Element references
let timeElement;
let statusElement;
let instructionElement;

/**
 * Initializes UI module and gets references to DOM elements.
 */
export function initUI() {
    timeElement = document.getElementById(CONSTANTS.GAME.UI_TIMER_ELEMENT);
    statusElement = document.getElementById(CONSTANTS.GAME.UI_STATUS_ELEMENT);
    instructionElement = document.getElementById(CONSTANTS.GAME.UI_INSTRUCTION_ELEMENT);
    
    // Set initial instruction
    if (instructionElement) {
        instructionElement.textContent = "Click to Look | WASD to Move | Find the Key (Green)";
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