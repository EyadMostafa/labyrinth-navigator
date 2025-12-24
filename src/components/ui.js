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

/**
 * Shows the game over screen with win/loss message
 * @param {boolean} didWin - True if player won, false if lost
 */
export function showGameOverScreen(didWin) {
    const screen = document.getElementById('game-over-screen');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const message2 = document.getElementById('result-message2');

    // Create and play sound
    const sound = new Audio(didWin ? './assets/sounds/lizard_roaring_sound_01.wav' : './assets/sounds/horror-scream-1.wav');
    sound.volume = 0.9;
    sound.play().catch(err => console.log('Audio play failed:', err));
    
    // Set background based on win/loss
    if (didWin) {
        // Win: Gradient background (green/cyan theme)
        //screen.style.background = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        screen.style.backgroundImage = "url('./assets/images/dungeon gate.jpg')";
        screen.style.backgroundSize = 'cover';
        screen.style.backgroundPosition = "center 21%";
        
        title.textContent = "YOU ESCAPED!";
        title.style.color = "#00ffff";
        message.textContent = "You have survived the Entrance. Now, the Labyrinth begins to breathe.";
        message2.textContent = "Level 1 survived. The darkness is adapting to your movements.";
        message2.style.color = "#820303";
    } else {
        // Loss: Dark red gradient
        //screen.style.background = 'linear-gradient(135deg, #2d0a0a 0%, #4a0e0e 50%, #661414 100%)';
        screen.style.backgroundImage = "url('./assets/images/bloody horror background.jfif')";
        screen.style.backgroundSize = 'cover';
        
        title.textContent = "TIME'S UP!";
        title.style.color = "#ff4444";
        message.textContent = "You failed to escape in time. Try again!";
    }
    
    // Show the screen
    screen.classList.remove('hidden');
    
    // Setup restart button
    document.getElementById('restart-btn').onclick = () => {
        location.reload();
    };
}
