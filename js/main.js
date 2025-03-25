import * as THREE from 'three';
import { Game } from './game/Game.js';
import { InputManager } from './game/InputManager.js';
import { Assets } from './game/Assets.js';

// Initialize the game when the window loads
window.addEventListener('load', () => {
  // Create the main game instance
  const game = new Game();
  
  // Start the game loop
  game.start();
  
  // Resize handler
  window.addEventListener('resize', () => {
    game.resize(window.innerWidth, window.innerHeight);
  });
}); 