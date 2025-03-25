import * as THREE from 'three';
import { InputManager } from './InputManager.js';
import { Player } from './entities/Player.js';
import { EnemyManager } from './entities/EnemyManager.js';
import { ParallaxBackground } from './environment/ParallaxBackground.js';
import { DayNightCycle } from './environment/DayNightCycle.js';
import { CollisionManager } from './CollisionManager.js';
import { UIManager } from './UIManager.js';

export class Game {
  constructor() {
    // Game state
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.currentBiome = 0; // 0: Cityscape, 1: Farmland, 2: Ocean, 3: Jungle
    this.biomeChangeTimer = 0;
    this.biomeChangeDuration = 120; // 2 minutes in seconds
    this.difficultyTimer = 0;
    this.difficultyIncreaseDuration = 30; // 30 seconds
    this.difficulty = 1;
    this.powerUps = []; // Initialize the powerUps array
    this.weaponPickups = []; // Initialize weapon pickups array
    this.damageNumbers = []; // Initialize damage numbers array
    
    // Weapon drop settings
    this.weaponDropRate = 0.2; // 20% chance per enemy killed
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    // Setup camera (orthographic for 2D)
    const aspectRatio = window.innerWidth / window.innerHeight;
    const cameraHeight = 100;
    const cameraWidth = cameraHeight * aspectRatio;
    this.camera = new THREE.OrthographicCamera(
      -cameraWidth / 2, cameraWidth / 2,
      cameraHeight / 2, -cameraHeight / 2,
      0.1, 1000
    );
    this.camera.position.z = 10;
    
    // Create scene
    this.scene = new THREE.Scene();
    
    // Initialize input manager
    this.inputManager = new InputManager();
    
    // Initialize UI manager
    this.uiManager = new UIManager();
    this.uiManager.setGameReference(this);
    
    // Initialize collision manager
    this.collisionManager = new CollisionManager();
    
    // Initialize environment
    this.background = new ParallaxBackground(this);
    this.scene.add(this.background.container);
    
    // Initialize day/night cycle
    this.dayNightCycle = new DayNightCycle(this);
    
    // Initialize player
    this.player = new Player(this);
    this.scene.add(this.player.sprite);
    
    // Initialize enemy manager
    this.enemyManager = new EnemyManager(this);
    
    // Initialize timing
    this.clock = new THREE.Clock();
    this.lastTime = 0;
  }
  
  start() {
    this.clock.start();
    this.animate();
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Return early if game is over
    if (this.isGameOver) return;
    
    const time = this.clock.getElapsedTime();
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    if (!this.isPaused) {
      this.update(deltaTime);
    }
    
    this.render();
  }
  
  update(deltaTime) {
    // Update day/night cycle
    this.dayNightCycle.update(deltaTime);
    
    // Update biome change timer
    this.biomeChangeTimer += deltaTime;
    if (this.biomeChangeTimer >= this.biomeChangeDuration) {
      this.biomeChangeTimer = 0;
      this.currentBiome = (this.currentBiome + 1) % 4;
      this.background.setBiome(this.currentBiome, this.dayNightCycle.isNight);
    }
    
    // Update difficulty timer
    this.difficultyTimer += deltaTime;
    if (this.difficultyTimer >= this.difficultyIncreaseDuration) {
      this.difficultyTimer = 0;
      this.difficulty += 0.25;
    }
    
    // Update player
    this.player.update(deltaTime);
    
    // Update enemies
    this.enemyManager.update(deltaTime);
    
    // Update power-ups
    if (this.powerUps) {
      for (let i = this.powerUps.length - 1; i >= 0; i--) {
        this.powerUps[i].update(deltaTime);
      }
    }
    
    // Update weapon pickups
    if (this.weaponPickups) {
      for (let i = this.weaponPickups.length - 1; i >= 0; i--) {
        this.weaponPickups[i].update(deltaTime);
      }
    }
    
    // Update damage numbers
    if (this.damageNumbers) {
      for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
        this.damageNumbers[i].update(deltaTime);
      }
    }
    
    // Update background
    this.background.update(deltaTime);
    
    // Check collisions
    this.collisionManager.checkCollisions(this);
    
    // Update UI
    this.uiManager.update(this);
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  resize(width, height) {
    // Update renderer
    this.renderer.setSize(width, height);
    
    // Update camera
    const aspectRatio = width / height;
    const cameraHeight = 100;
    const cameraWidth = cameraHeight * aspectRatio;
    
    this.camera.left = -cameraWidth / 2;
    this.camera.right = cameraWidth / 2;
    this.camera.top = cameraHeight / 2;
    this.camera.bottom = -cameraHeight / 2;
    this.camera.updateProjectionMatrix();
    
    // Update background
    this.background.resize(width, height);
  }
  
  addScore(points) {
    this.score += points;
    this.uiManager.updateScore(this.score);
  }
  
  gameOver() {
    this.isGameOver = true;
    this.uiManager.showGameOver(this.score);
    
    // Connect the restart handler to the game's restart method
    this.uiManager.restartHandler = () => {
      this.restart();
    };
  }
  
  restart() {
    // Reset game state
    this.score = 0;
    this.isGameOver = false;
    this.currentBiome = 0;
    this.biomeChangeTimer = 0;
    this.difficultyTimer = 0;
    this.difficulty = 1;
    this.lastTime = 0;
    
    // Reset clock properly
    this.clock.stop();
    this.clock.start();
    
    // Reset player
    this.player.reset();
    
    // Clear enemies and their projectiles
    this.enemyManager.reset();
    
    // Clear power-ups
    if (this.powerUps) {
      this.powerUps.forEach(powerUp => this.scene.remove(powerUp.sprite));
      this.powerUps = [];
    }
    
    // Clear weapon pickups
    if (this.weaponPickups) {
      this.weaponPickups.forEach(pickup => {
        pickup.remove(); // Properly dispose of resources
      });
      this.weaponPickups = [];
    }
    
    // Clear damage numbers
    if (this.damageNumbers) {
      this.damageNumbers.forEach(damageNumber => {
        if (damageNumber.sprite) {
          this.scene.remove(damageNumber.sprite);
        }
      });
      this.damageNumbers = [];
    }
    
    // Reset background
    this.background.setBiome(this.currentBiome, this.dayNightCycle.isNight);
    
    // Reset UI
    this.uiManager.reset();
    
    // Don't call start() again as it would create duplicate animation loops
    // Just set isGameOver to false so the existing loop continues
  }
} 