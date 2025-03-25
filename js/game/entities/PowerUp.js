import * as THREE from 'three';

export class PowerUp {
  constructor(game, x, y, type) {
    this.game = game;
    this.position = { x, y };
    this.type = type;
    this.velocity = { x: -20, y: 0 }; // Moves left
    this.isCollected = false;
    this.time = 0;
    
    // Set properties based on type
    this.setProperties();
    
    // Create sprite
    this.createSprite();
  }
  
  setProperties() {
    switch(this.type) {
      case 0: // Health
        this.color = 0xff3030; // Red
        this.healAmount = 25;
        break;
      case 1: // Fuel
        this.color = 0x30a0ff; // Blue
        break;
      case 2: // Shotgun ammo
        this.color = 0xff9933; // Orange
        this.ammoAmount = 30;
        break;
      case 3: // Laser charge
        this.color = 0xff00ff; // Purple
        this.chargeAmount = 50;
        break;
      case 4: // Jetpack upgrade
        this.color = 0xffff00; // Yellow
        break;
    }
  }
  
  createSprite() {
    // Create a group for the power-up
    this.sprite = new THREE.Group();
    
    // Create outer shape based on type
    let geometry;
    
    if (this.type === 0) {
      // Cross shape for health
      geometry = new THREE.BufferGeometry().setFromPoints([
        // Vertical line
        new THREE.Vector3(0, -2, 0),
        new THREE.Vector3(0, 2, 0),
        // Horizontal line
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(2, 0, 0)
      ]);
      const lines = new THREE.LineSegments(geometry, 
        new THREE.LineBasicMaterial({ color: this.color, linewidth: 2 })
      );
      this.sprite.add(lines);
      
    } else if (this.type === 1) {
      // Fuel cell shape
      geometry = new THREE.BoxGeometry(3, 4, 1);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ 
          color: this.color,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        })
      );
      this.sprite.add(mesh);
      
    } else if (this.type === 2) {
      // Shotgun ammo
      geometry = new THREE.BoxGeometry(3, 4, 1);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ 
          color: this.color,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        })
      );
      this.sprite.add(mesh);
      
    } else if (this.type === 3) {
      // Laser charge
      geometry = new THREE.BoxGeometry(3, 4, 1);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ 
          color: this.color,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        })
      );
      this.sprite.add(mesh);
      
    } else if (this.type === 4) {
      // Jetpack upgrade
      geometry = new THREE.BoxGeometry(3, 4, 1);
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ 
          color: this.color,
          wireframe: true,
          transparent: true,
          opacity: 0.8
        })
      );
      this.sprite.add(mesh);
    }
    
    // Add inner glow
    const glowGeometry = new THREE.CircleGeometry(1.5, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.sprite.add(glow);
    
    // Set initial position
    this.sprite.position.set(this.position.x, this.position.y, 1);
  }
  
  update(deltaTime) {
    if (this.isCollected) return;
    
    // Update time
    this.time += deltaTime;
    
    // Move power-up
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += Math.sin(this.time * 3) * 0.5 * deltaTime; // Slight bobbing motion
    
    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y, 1);
    
    // Pulsing effect
    const scale = 1 + Math.sin(this.time * 5) * 0.2;
    this.sprite.scale.set(scale, scale, 1);
    
    // Rotate slightly
    this.sprite.rotation.z += deltaTime;
    
    // Check if out of bounds
    if (this.position.x < this.game.camera.left - 5) {
      this.remove();
    }
    
    // Check for collision with player
    this.checkPlayerCollision();
  }
  
  checkPlayerCollision() {
    const player = this.game.player;
    if (!player.isAlive) return;
    
    // Simple distance-based collision
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Enlarged collision radius for easier pickup (5 → 8)
    if (distance < 8) { // Increased collision radius
      console.log(`Power-up collected: ${this.type}`); // Debug logging
      this.collect();
    }
  }
  
  collect() {
    if (this.isCollected) return; // Prevent collecting twice
    this.isCollected = true;
    
    // Apply effect based on type
    switch(this.type) {
      case 0: // Health
        // Heal player
        this.game.player.health = Math.min(
          this.game.player.maxHealth,
          this.game.player.health + this.healAmount
        );
        console.log(`Health restored to ${this.game.player.health}`); // Debug logging
        break;
      case 1: // Fuel
        // Refill jetpack fuel
        this.game.player.jetpack.fuel = this.game.player.jetpack.maxFuel;
        console.log(`Jetpack fuel refilled`); // Debug logging
        break;
      case 2: // Shotgun ammo
        // Add ammo to shotgun
        const shotgun = this.game.player.weapons[1];
        shotgun.addAmmo(this.ammoAmount);
        console.log(`Shotgun ammo added: ${shotgun.ammo}/${shotgun.maxAmmo}`); // Debug logging
        break;
      case 3: // Laser charge
        // Add charge to laser
        const laser = this.game.player.weapons[2];
        laser.addCharge(this.chargeAmount);
        console.log(`Laser charge added: ${laser.charge}/${laser.maxCharge}`); // Debug logging
        break;
      case 4: // Jetpack upgrade
        // Upgrade jetpack
        const currentLevel = this.game.player.jetpack.level;
        this.game.player.upgradeJetpack(currentLevel + 1);
        console.log(`Jetpack upgraded to level ${currentLevel + 1}`); // Debug logging
        break;
    }
    
    // Visual feedback - create a separate effect that doesn't rely on the original sprite
    this.addPickupEffect();
    
    // Remove powerup immediately to prevent it from lingering
    // Create a detached visual effect for feedback instead
    this.remove();
  }
  
  addPickupEffect() {
    // Create a flash effect at pickup location that's not a child of this.sprite
    const flashGeometry = new THREE.CircleGeometry(6, 16);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.7
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.set(this.position.x, this.position.y, 2); // Position in world space
    
    // Add directly to the scene
    this.game.scene.add(flash);
    
    // Make it expand and fade
    let size = 1;
    const expandInterval = setInterval(() => {
      size += 0.2;
      flash.scale.set(size, size, 1);
      if (flash.material) {
        flash.material.opacity -= 0.05;
      }
      if (size > 3 || flash.material.opacity <= 0) {
        clearInterval(expandInterval);
        this.game.scene.remove(flash);
        // Clean up geometry and material
        if (flashGeometry) flashGeometry.dispose();
        if (flashMaterial) flashMaterial.dispose();
      }
    }, 20);
  }
  
  remove() {
    // Remove from scene
    this.game.scene.remove(this.sprite);
    
    // Remove from power-ups array
    const index = this.game.powerUps.indexOf(this);
    if (index !== -1) {
      this.game.powerUps.splice(index, 1);
    }
  }
} 