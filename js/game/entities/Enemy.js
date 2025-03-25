import * as THREE from 'three';
import { PowerUp } from './PowerUp.js';
import { WeaponPickup } from './WeaponPickup.js';

export class Enemy {
  constructor(game, x, y, type, behavior, options = {}) {
    this.game = game;
    this.position = { x, y };
    this.type = type;
    this.behavior = behavior;
    this.options = options;
    this.velocity = { x: 0, y: 0 };
    this.time = 0; // Used for movement patterns
    this.isAlive = true;
    
    // Set properties based on type
    this.setProperties();
    
    // Create enemy sprite
    this.createSprite();
  }
  
  setProperties() {
    // Base speed value for this difficulty
    const baseSpeed = 30 + (this.game.difficulty * 5);
    
    // Set properties based on enemy type
    switch(this.type) {
      case 'triangle':
        this.health = 15;
        this.size = 2.5;
        this.speed = baseSpeed * 1.2;
        this.damage = 10;
        break;
      case 'square':
        this.health = 30;
        this.size = 3.5;
        this.speed = baseSpeed * 0.8;
        this.damage = 20;
        break;
      case 'circle':
        this.health = 40;
        this.size = 4;
        this.speed = baseSpeed * 0.7;
        this.damage = 15;
        this.splitsOnDeath = true;
        break;
      case 'pentagon':
        this.health = 60;
        this.size = 4.5;
        this.speed = baseSpeed * 0.6;
        this.damage = 30;
        this.canShoot = true;
        this.shootCooldown = 0;
        this.projectiles = [];
        break;
    }
    
    // Night-time enemies are faster
    if (this.game.dayNightCycle.isNight) {
      this.speed *= 1.3;
    }
    
    // Behavior-specific adjustments
    if (this.behavior === 'swarm') {
      this.speed *= 1.1;
      this.size *= 0.8;
      this.health *= 0.7;
    } else if (this.behavior === 'formation') {
      this.health *= 1.2;
    }
  }
  
  createSprite() {
    this.sprite = new THREE.Group();
    
    // Create outline material with glow effect
    const material = new THREE.LineBasicMaterial({
      color: this.getColorForType(),
      linewidth: 2
    });
    
    let geometry;
    
    // Create geometry based on type
    switch(this.type) {
      case 'triangle':
        // Create triangle shape
        geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, this.size, 0),
          new THREE.Vector3(-this.size * 0.866, -this.size / 2, 0),
          new THREE.Vector3(this.size * 0.866, -this.size / 2, 0),
          new THREE.Vector3(0, this.size, 0)
        ]);
        break;
      case 'square':
        // Create square shape
        const halfSize = this.size / 2;
        geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-halfSize, -halfSize, 0),
          new THREE.Vector3(halfSize, -halfSize, 0),
          new THREE.Vector3(halfSize, halfSize, 0),
          new THREE.Vector3(-halfSize, halfSize, 0),
          new THREE.Vector3(-halfSize, -halfSize, 0)
        ]);
        break;
      case 'circle':
        // Create circle shape
        const circle = new THREE.CircleGeometry(this.size, 16);
        const edgesGeometry = new THREE.EdgesGeometry(circle);
        geometry = edgesGeometry;
        break;
      case 'pentagon':
        // Create pentagon shape
        const points = [];
        for (let i = 0; i <= 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          points.push(new THREE.Vector3(
            Math.sin(angle) * this.size,
            Math.cos(angle) * this.size,
            0
          ));
        }
        geometry = new THREE.BufferGeometry().setFromPoints(points);
        break;
    }
    
    // Create the shape outline
    const shape = new THREE.Line(geometry, material);
    this.sprite.add(shape);
    
    // Add inner fill (partially transparent)
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: this.getColorForType(),
      transparent: true,
      opacity: 0.3
    });
    
    let fillGeometry;
    switch(this.type) {
      case 'triangle':
        fillGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, this.size, 0),
          new THREE.Vector3(-this.size * 0.866, -this.size / 2, 0),
          new THREE.Vector3(this.size * 0.866, -this.size / 2, 0)
        ]);
        const fill = new THREE.Mesh(fillGeometry, fillMaterial);
        this.sprite.add(fill);
        break;
      case 'square':
        const halfSize = this.size / 2;
        fillGeometry = new THREE.PlaneGeometry(this.size, this.size);
        const fill2 = new THREE.Mesh(fillGeometry, fillMaterial);
        this.sprite.add(fill2);
        break;
      case 'circle':
        fillGeometry = new THREE.CircleGeometry(this.size, 16);
        const fill3 = new THREE.Mesh(fillGeometry, fillMaterial);
        this.sprite.add(fill3);
        break;
      case 'pentagon':
        // Pentagon fill is more complex, we'll use a simple approximation
        fillGeometry = new THREE.CircleGeometry(this.size * 0.95, 5);
        const fill4 = new THREE.Mesh(fillGeometry, fillMaterial);
        this.sprite.add(fill4);
        break;
    }
    
    // Set initial position
    this.sprite.position.set(this.position.x, this.position.y, 1);
  }
  
  getColorForType() {
    // Different colors for different enemy types
    switch(this.type) {
      case 'triangle':
        return 0x00ff00; // Green
      case 'square':
        return 0x0088ff; // Blue
      case 'circle':
        return 0xff8800; // Orange
      case 'pentagon':
        return 0xff00ff; // Purple
      default:
        return 0xffffff; // White
    }
  }
  
  update(deltaTime) {
    if (!this.isAlive) return;
    
    // Increment time counter (for movement patterns)
    this.time += deltaTime;
    
    // Update based on behavior
    switch(this.behavior) {
      case 'solo':
        this.updateSolo(deltaTime);
        break;
      case 'formation':
        this.updateFormation(deltaTime);
        break;
      case 'swarm':
        this.updateSwarm(deltaTime);
        break;
    }
    
    // Apply velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Rotate shape
    this.sprite.rotation.z += deltaTime * (this.behavior === 'swarm' ? 2 : 1);
    
    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y, 1);
    
    // Handle pentagon shooting
    if (this.canShoot) {
      this.updateShooting(deltaTime);
    }
    
    // Update projectiles
    this.updateProjectiles(deltaTime);
    
    // Pulse effect (scale up and down slightly)
    const pulse = 1 + Math.sin(this.time * 5) * 0.1;
    this.sprite.scale.set(pulse, pulse, 1);
  }
  
  updateSolo(deltaTime) {
    // Solo enemies move directly toward the player
    const playerPos = this.game.player.position;
    
    // Calculate direction to player
    const dx = playerPos.x - this.position.x;
    const dy = playerPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Set velocity toward player
    if (distance > 0) {
      this.velocity.x = (dx / distance) * -this.speed; // Always move leftward, but aim at player
      this.velocity.y = (dy / distance) * this.speed * 0.7; // Slower vertical movement
    }
  }
  
  updateFormation(deltaTime) {
    const { formationType, position, count } = this.options;
    
    // Base leftward movement
    this.velocity.x = -this.speed * 0.8;
    
    if (formationType === 'sine') {
      // Sine wave movement
      const amplitude = 20;
      const frequency = 1;
      
      // Current y position in the wave
      const targetY = Math.sin(this.time * frequency + position) * amplitude;
      
      // Smooth movement toward target y
      this.velocity.y = (targetY - this.position.y) * 2;
    } else if (formationType === 'v') {
      // V-shape maintains its form while moving
      // The formation was already established at spawn time
      this.velocity.y = 0;
    }
  }
  
  updateSwarm(deltaTime) {
    // Swarm behavior: chaotic movement with some flocking
    
    // Random chaotic movement
    if (Math.random() < 0.05) {
      this.velocity.x = -this.speed * (0.5 + Math.random() * 0.5);
      this.velocity.y = (Math.random() * 2 - 1) * this.speed;
    }
    
    // Gradual slowdown of vertical movement
    this.velocity.y *= 0.98;
    
    // Ensure continued leftward movement
    if (this.velocity.x > -this.speed * 0.2) {
      this.velocity.x = -this.speed * 0.3;
    }
  }
  
  updateShooting(deltaTime) {
    // Decrease cooldown
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }
    
    // Check if can shoot
    if (this.shootCooldown <= 0) {
      this.shootCooldown = 2 / this.game.difficulty; // Cooldown based on difficulty
      
      // Create projectile
      this.shoot();
    }
  }
  
  shoot() {
    // Create a projectile geometry
    const projectileGeometry = new THREE.CircleGeometry(0.5, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
    
    // Set initial position
    projectile.position.set(this.position.x, this.position.y, 1);
    
    // Add to scene
    this.game.scene.add(projectile);
    
    // Calculate direction to player
    const playerPos = this.game.player.position;
    const dx = playerPos.x - this.position.x;
    const dy = playerPos.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create projectile object
    const projectileObj = {
      sprite: projectile,
      position: { x: this.position.x, y: this.position.y },
      velocity: {
        x: (dx / distance) * 30,
        y: (dy / distance) * 30
      },
      damage: 10
    };
    
    // Add to projectiles array
    this.projectiles.push(projectileObj);
    
    // Add to global projectiles collection for cleanup
    this.game.enemyManager.allProjectiles.push(projectileObj);
  }
  
  updateProjectiles(deltaTime) {
    if (!this.projectiles) return;
    
    // Update each projectile
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      
      // Update sprite
      projectile.sprite.position.set(projectile.position.x, projectile.position.y, 1);
      
      // Check if projectile is out of bounds
      if (projectile.position.x < this.game.camera.left ||
          projectile.position.x > this.game.camera.right ||
          projectile.position.y < this.game.camera.bottom ||
          projectile.position.y > this.game.camera.top) {
        // Remove from scene
        this.game.scene.remove(projectile.sprite);
        
        // Remove from global projectiles collection
        const globalIndex = this.game.enemyManager.allProjectiles.indexOf(projectile);
        if (globalIndex !== -1) {
          this.game.enemyManager.allProjectiles.splice(globalIndex, 1);
        }
        
        // Remove from array
        this.projectiles.splice(i, 1);
      }
    }
  }
  
  takeDamage(amount) {
    // Reduce health
    this.health -= amount;
    
    // Flash effect - enhance with a more visible hit effect
    const originalColor = this.sprite.children[0].material.color.clone();
    
    // Flash the entire enemy white
    this.sprite.children.forEach(child => {
      if (child.material && child.material.color) {
        child.material.color.set(0xffffff);
      }
    });
    
    // Create a hit flash effect
    const hitGeometry = new THREE.CircleGeometry(this.size * 1.2, 8);
    const hitMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    const hitFlash = new THREE.Mesh(hitGeometry, hitMaterial);
    hitFlash.position.set(0, 0, 1);
    this.sprite.add(hitFlash);
    
    // Fade out hit flash
    let flashOpacity = 0.7;
    const fadeInterval = setInterval(() => {
      flashOpacity -= 0.1;
      if (flashOpacity <= 0) {
        this.sprite.remove(hitFlash);
        clearInterval(fadeInterval);
      } else if (hitFlash.material) {
        hitFlash.material.opacity = flashOpacity;
      }
    }, 30);
    
    // Reset color after a short time
    setTimeout(() => {
      this.sprite.children.forEach(child => {
        if (child.material && child.material.color && child !== hitFlash) {
          child.material.color.copy(originalColor);
        }
      });
    }, 50);
    
    // Check if dead
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.isAlive = false;
    
    // Handle circle splitting
    if (this.splitsOnDeath && this.size > 2) {
      this.split();
    }
    
    // Add score
    const points = this.game.enemyManager.getPointsForType(this.type);
    this.game.addScore(points);
    
    // Chance to spawn power-up
    if (Math.random() < 0.1) {
      this.spawnPowerUp();
    }
    
    // Chance to spawn weapon pickup
    if (Math.random() < this.game.weaponDropRate) {
      this.spawnWeaponPickup();
    }
    
    // Remove from scene
    this.game.scene.remove(this.sprite);
    
    // Remove projectiles
    if (this.projectiles) {
      this.projectiles.forEach(projectile => {
        this.game.scene.remove(projectile.sprite);
        
        // Remove from global projectiles collection
        const globalIndex = this.game.enemyManager.allProjectiles.indexOf(projectile);
        if (globalIndex !== -1) {
          this.game.enemyManager.allProjectiles.splice(globalIndex, 1);
        }
      });
    }
    
    // Remove from enemies array
    const index = this.game.enemyManager.enemies.indexOf(this);
    if (index !== -1) {
      this.game.enemyManager.enemies.splice(index, 1);
    }
  }
  
  split() {
    // Create smaller circles when a circle is destroyed
    const numCircles = 2 + Math.floor(Math.random() * 2); // 2-3 smaller circles
    
    for (let i = 0; i < numCircles; i++) {
      // Calculate spawn position with slight offset
      const angle = (i / numCircles) * Math.PI * 2;
      const x = this.position.x + Math.cos(angle) * 2;
      const y = this.position.y + Math.sin(angle) * 2;
      
      // Create smaller circle
      const miniCircle = new Enemy(
        this.game,
        x,
        y,
        'circle',
        'solo'
      );
      
      // Adjust properties for mini circle
      miniCircle.size = this.size * 0.5;
      miniCircle.health = this.health * 0.4;
      miniCircle.speed = this.speed * 1.2;
      miniCircle.splitsOnDeath = false; // Prevent infinite splitting
      
      // Create new sprite with updated size
      miniCircle.createSprite();
      
      // Add to scene
      this.game.scene.add(miniCircle.sprite);
      
      // Add to enemies array
      this.game.enemyManager.enemies.push(miniCircle);
    }
  }
  
  spawnPowerUp() {
    // Determine power-up type
    let type;
    const rand = Math.random();
    
    if (rand < 0.35) {
      type = 0; // Health
    } else if (rand < 0.65) {
      type = 1; // Fuel
    } else if (rand < 0.8) {
      type = 2; // Shotgun ammo
    } else if (rand < 0.9) {
      type = 3; // Laser charge
    } else {
      type = 4; // Jetpack upgrade
    }
    
    // Create power-up
    const powerUp = new PowerUp(
      this.game,
      this.position.x,
      this.position.y,
      type
    );
    
    // Add to scene
    this.game.scene.add(powerUp.sprite);
    
    // Add to power-ups array
    if (!this.game.powerUps) {
      this.game.powerUps = [];
    }
    this.game.powerUps.push(powerUp);
  }
  
  spawnWeaponPickup() {
    // Determine weapon type (exclude current weapon that player has equipped)
    let weaponType;
    const currentWeapon = this.game.player.currentWeapon;
    
    // Choose a different weapon than the current one
    do {
      weaponType = Math.floor(Math.random() * 3); // 0: Pistol, 1: Shotgun, 2: Laser
    } while (weaponType === currentWeapon);
    
    // Create weapon pickup
    const weaponPickup = new WeaponPickup(
      this.game,
      this.position.x,
      this.position.y,
      weaponType
    );
    
    // Add to scene
    this.game.scene.add(weaponPickup.sprite);
    
    // Add to weapon pickups array
    if (!this.game.weaponPickups) {
      this.game.weaponPickups = [];
    }
    this.game.weaponPickups.push(weaponPickup);
  }
} 