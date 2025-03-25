import * as THREE from 'three';
import { Enemy } from './Enemy.js';

export class EnemyManager {
  constructor(game) {
    this.game = game;
    
    // Enemy configuration
    this.enemies = []; // Active enemies
    this.spawnTimer = 0;
    this.baseSpawnInterval = 2; // Reduced from 3 to 2 seconds between waves
    this.waveSize = 4; // Increased starting wave size from 3 to 4
    this.maxWaveSize = 15;
    
    // Global collection of all projectiles for easy cleanup
    this.allProjectiles = [];
    
    // Enemy types
    this.enemyTypes = [
      { type: 'triangle', weight: 6, points: 10 },
      { type: 'square', weight: 4, points: 20 },
      { type: 'circle', weight: 2, points: 50 },
      { type: 'pentagon', weight: 1, points: 100 }
    ];
    
    // Total weight for enemy type selection
    this.totalWeight = this.enemyTypes.reduce((acc, type) => acc + type.weight, 0);
  }
  
  update(deltaTime) {
    // Update spawn timer
    this.spawnTimer += deltaTime;
    
    // Check if it's time to spawn a new wave
    const spawnInterval = this.baseSpawnInterval * Math.pow(0.9, this.game.difficulty - 1);
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnWave();
    }
    
    // Update existing enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Update enemy
      enemy.update(deltaTime);
      
      // Check if enemy is out of bounds (left side of screen)
      if (enemy.position.x < this.game.camera.left - 10) {
        // Remove enemy from scene
        this.game.scene.remove(enemy.sprite);
        
        // Remove from enemies array
        this.enemies.splice(i, 1);
      }
    }
  }
  
  spawnWave() {
    // Calculate wave size based on difficulty
    const currentWaveSize = Math.min(
      this.maxWaveSize,
      Math.floor(this.waveSize + this.game.difficulty * 0.5)
    );
    
    // Determine wave pattern
    const pattern = this.getRandomPattern();
    
    // Spawn enemies based on pattern
    switch(pattern) {
      case 'solo':
        this.spawnSoloEnemies(currentWaveSize);
        break;
      case 'formation':
        this.spawnFormation(currentWaveSize);
        break;
      case 'swarm':
        this.spawnSwarm(currentWaveSize + 5); // Swarms are larger
        break;
    }
  }
  
  getRandomPattern() {
    // Determine pattern based on difficulty
    const patterns = ['solo', 'formation', 'swarm'];
    const weights = [
      3 - Math.min(2, this.game.difficulty * 0.3), // Solo becomes less common
      1 + Math.min(2, this.game.difficulty * 0.2), // Formations become more common
      Math.min(3, this.game.difficulty * 0.5)      // Swarms appear more with difficulty
    ];
    
    // Get random pattern based on weights
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < patterns.length; i++) {
      if (random < weights[i]) {
        return patterns[i];
      }
      random -= weights[i];
    }
    
    return 'solo'; // Default fallback
  }
  
  getRandomEnemyType() {
    // Random weighted selection of enemy type
    let random = Math.random() * this.totalWeight;
    
    for (const enemyType of this.enemyTypes) {
      if (random < enemyType.weight) {
        return enemyType.type;
      }
      random -= enemyType.weight;
    }
    
    return 'triangle'; // Default fallback
  }
  
  spawnSoloEnemies(count) {
    // Spawn individual enemies that move directly at the player
    for (let i = 0; i < count; i++) {
      // Get spawn position at right edge with random height
      const x = this.game.camera.right + 5;
      const y = (Math.random() * 2 - 1) * this.game.camera.top * 0.8;
      
      // Create enemy
      const enemyType = this.getRandomEnemyType();
      const enemy = new Enemy(
        this.game,
        x,
        y,
        enemyType,
        'solo'
      );
      
      // Add to scene
      this.game.scene.add(enemy.sprite);
      
      // Add to enemies array
      this.enemies.push(enemy);
    }
  }
  
  spawnFormation(count) {
    // Spawn a formation of enemies that move in a pattern
    const formationType = Math.random() < 0.5 ? 'v' : 'sine';
    const enemyType = this.getRandomEnemyType();
    
    // Starting position
    const startX = this.game.camera.right + 5;
    const startY = (Math.random() * 2 - 1) * this.game.camera.top * 0.5;
    
    for (let i = 0; i < count; i++) {
      let x, y;
      
      if (formationType === 'v') {
        // V-shaped formation
        const offset = (i - (count - 1) / 2) * 5;
        x = startX + Math.abs(offset) * 2;
        y = startY + offset;
      } else {
        // Sine wave formation
        x = startX + i * 3;
        y = startY;
      }
      
      // Create enemy
      const enemy = new Enemy(
        this.game,
        x,
        y,
        enemyType,
        'formation',
        { formationType, position: i, count }
      );
      
      // Add to scene
      this.game.scene.add(enemy.sprite);
      
      // Add to enemies array
      this.enemies.push(enemy);
    }
  }
  
  spawnSwarm(count) {
    // Spawn a tightly-packed swarm of small enemies
    const centerX = this.game.camera.right + 10;
    const centerY = (Math.random() * 2 - 1) * this.game.camera.top * 0.5;
    
    // Swarms are mostly triangles
    const enemyType = Math.random() < 0.8 ? 'triangle' : 'square';
    
    for (let i = 0; i < count; i++) {
      // Random position within cluster
      const offsetX = (Math.random() * 2 - 1) * 10;
      const offsetY = (Math.random() * 2 - 1) * 10;
      
      // Create enemy
      const enemy = new Enemy(
        this.game,
        centerX + offsetX,
        centerY + offsetY,
        enemyType,
        'swarm'
      );
      
      // Add to scene
      this.game.scene.add(enemy.sprite);
      
      // Add to enemies array
      this.enemies.push(enemy);
    }
  }
  
  getPointsForType(type) {
    const enemyType = this.enemyTypes.find(et => et.type === type);
    return enemyType ? enemyType.points : 10;
  }
  
  reset() {
    // Clear all enemies
    this.enemies.forEach(enemy => this.game.scene.remove(enemy.sprite));
    this.enemies = [];
    
    // Clear all projectiles
    this.allProjectiles.forEach(projectile => {
      if (projectile && projectile.sprite) {
        this.game.scene.remove(projectile.sprite);
      }
    });
    this.allProjectiles = [];
    
    this.spawnTimer = 0;
  }
} 