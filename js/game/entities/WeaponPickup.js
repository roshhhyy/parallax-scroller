import * as THREE from 'three';
import { WeaponModel } from './WeaponModel.js';

export class WeaponPickup {
  constructor(game, x, y, weaponType) {
    this.game = game;
    this.position = { x, y };
    this.weaponType = weaponType;
    this.isCollected = false;
    this.time = 0;
    this.lifetime = 10; // Despawn after 10 seconds
    this.proximityPrompt = false; // Track if we're showing the prompt
    
    // Create sprite with weapon model
    this.createSprite();
    
    // Create prompt element (hidden initially)
    this.createPrompt();
  }
  
  createSprite() {
    // Create a group for the pickup
    this.sprite = new THREE.Group();
    
    // Create weapon model
    this.weaponModel = new WeaponModel(this.weaponType);
    
    // Scale down the weapon model slightly
    this.weaponModel.sprite.scale.set(0.8, 0.8, 0.8);
    
    // Add to pickup group
    this.sprite.add(this.weaponModel.sprite);
    
    // Add background glow based on weapon type
    const glowColor = this.getColorForWeaponType();
    const glowGeometry = new THREE.CircleGeometry(3, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.3
    });
    
    this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.glow.position.z = -0.1; // Behind the weapon
    this.sprite.add(this.glow);
    
    // Set initial position
    this.sprite.position.set(this.position.x, this.position.y, 1);
  }
  
  createPrompt() {
    // Create a DOM element for the E prompt
    this.promptElement = document.createElement('div');
    this.promptElement.textContent = 'Press E to collect';
    this.promptElement.style.position = 'absolute';
    this.promptElement.style.color = 'white';
    this.promptElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.promptElement.style.padding = '5px 10px';
    this.promptElement.style.borderRadius = '5px';
    this.promptElement.style.fontFamily = 'Arial, sans-serif';
    this.promptElement.style.fontSize = '14px';
    this.promptElement.style.pointerEvents = 'none';
    this.promptElement.style.display = 'none';
    this.promptElement.style.zIndex = '10';
    
    // Add to document
    document.body.appendChild(this.promptElement);
  }
  
  getColorForWeaponType() {
    switch(this.weaponType) {
      case 0: // Pistol
        return 0x22aa22; // Green
      case 1: // Shotgun
        return 0xaa2222; // Red
      case 2: // Laser
        return 0x2222aa; // Blue
      default:
        return 0xaaaaaa; // Gray
    }
  }
  
  update(deltaTime) {
    if (this.isCollected) return;
    
    // Update lifetime
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.remove();
      return;
    }
    
    // Make it fade out when close to despawning
    if (this.lifetime < 3) {
      const opacity = this.lifetime / 3;
      this.sprite.children.forEach(child => {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => {
              if (m.transparent) m.opacity = opacity;
            });
          } else if (child.material.transparent) {
            child.material.opacity = opacity;
          }
        } else if (child.children) {
          child.children.forEach(grandchild => {
            if (grandchild.material && grandchild.material.transparent) {
              grandchild.material.opacity = opacity;
            }
          });
        }
      });
    }
    
    // Update time
    this.time += deltaTime;
    
    // Hovering effect (bobbing up and down)
    this.sprite.position.y = this.position.y + Math.sin(this.time * 2) * 0.5;
    
    // Rotation effect
    this.sprite.rotation.z = Math.sin(this.time * 0.5) * 0.1;
    
    // Update sprite position for x movement
    this.position.x += -20 * deltaTime; // Move left with the level
    this.sprite.position.x = this.position.x;
    
    // Check if out of bounds
    if (this.position.x < this.game.camera.left - 10) {
      this.remove();
      return;
    }
    
    // Check for collision with player
    this.checkPlayerCollision();
  }
  
  updatePromptPosition() {
    if (!this.proximityPrompt) return;
    
    // Convert 3D position to screen coordinates
    const vector = new THREE.Vector3();
    vector.set(this.position.x, this.position.y, 0);
    
    // Project the position to 2D screen space
    vector.project(this.game.camera);
    
    // Convert to screen coordinates
    const x = (vector.x + 1) * window.innerWidth / 2;
    const y = (-vector.y + 1) * window.innerHeight / 2 - 30; // Offset above the pickup
    
    // Update prompt position
    this.promptElement.style.left = `${x - this.promptElement.offsetWidth / 2}px`;
    this.promptElement.style.top = `${y}px`;
  }
  
  checkPlayerCollision() {
    const player = this.game.player;
    if (!player.isAlive) return;
    
    // Simple distance-based proximity check (not collision)
    const dx = player.position.x - this.position.x;
    const dy = player.position.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if player is near the weapon (larger radius for easier interaction)
    if (distance < 20) { // Increased proximity radius
      // Show the prompt if not already showing
      if (!this.proximityPrompt) {
        this.promptElement.style.display = 'block';
        this.proximityPrompt = true;
      }
      
      // Update prompt position
      this.updatePromptPosition();
      
      // ONLY check if E key is pressed to collect
      if (this.game.inputManager.keys.interact) {
        this.collect();
      }
    } else if (this.proximityPrompt) {
      // Hide prompt if player moves away
      this.promptElement.style.display = 'none';
      this.proximityPrompt = false;
    }
  }
  
  collect() {
    if (this.isCollected) return;
    this.isCollected = true;
    
    // Play collection effect
    this.createCollectionEffect();
    
    // Switch player to collected weapon
    const player = this.game.player;
    player.currentWeapon = this.weaponType;
    
    // Reset the weapon ammo/charge to full
    const weapon = player.weapons[this.weaponType];
    weapon.reset(); // This resets ammo and charge to full
    
    // Make sure to update the weapon model
    player.updateWeaponModel();
    
    // Update muzzle flash weapon type
    player.muzzleFlash.weaponType = this.weaponType;
    
    // Remove after a short delay for effect
    setTimeout(() => this.remove(), 200);
    
    console.log(`Weapon pickup collected: ${this.getWeaponName()} with full ammo`);
  }
  
  getWeaponName() {
    const weaponNames = ['Pistol', 'Shotgun', 'Laser'];
    return weaponNames[this.weaponType];
  }
  
  createCollectionEffect() {
    // Create flash effect at pickup location
    const flashGeometry = new THREE.CircleGeometry(5, 16);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: this.getColorForWeaponType(),
      transparent: true,
      opacity: 0.7
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    this.sprite.add(flash);
    
    // Scale up the weapon model for effect
    this.weaponModel.sprite.scale.set(1.2, 1.2, 1.2);
    
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
        this.sprite.remove(flash);
      }
    }, 20);
  }
  
  remove() {
    // Remove prompt element
    if (this.promptElement) {
      document.body.removeChild(this.promptElement);
    }
    
    // Clean up animations
    if (this.weaponModel) {
      this.weaponModel.dispose();
    }
    
    // Remove from scene
    this.game.scene.remove(this.sprite);
    
    // Remove from game's weapon pickups array
    if (this.game.weaponPickups) {
      const index = this.game.weaponPickups.indexOf(this);
      if (index !== -1) {
        this.game.weaponPickups.splice(index, 1);
      }
    }
  }
} 