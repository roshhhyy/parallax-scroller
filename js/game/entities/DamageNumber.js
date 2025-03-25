import * as THREE from 'three';

export class DamageNumber {
  constructor(game, x, y, damage, type = 'bullet') {
    this.game = game;
    this.position = { x, y };
    this.damage = damage;
    this.type = type; // 'bullet' or 'laser'
    this.time = 0;
    this.sprite = null;
    this.textMesh = null;
    this.isActive = true;
    this.accumulatedDamage = damage; // For laser
    
    // Different lifetime and behavior based on type
    if (this.type === 'bullet') {
      this.lifetime = 1.0; // 1 second for bullets
      this.createBulletDamageNumber();
    } else if (this.type === 'laser') {
      this.lifetime = 1.2; // Shortened from 3.0 to 1.2 seconds for laser damage counter
      this.createLaserDamageCounter();
    }
    
    // Add to scene
    this.game.scene.add(this.sprite);
    
    // Add to game's damage numbers array if it doesn't exist
    if (!this.game.damageNumbers) {
      this.game.damageNumbers = [];
    }
    this.game.damageNumbers.push(this);
  }
  
  createBulletDamageNumber() {
    // Create a text sprite for the damage number
    this.sprite = new THREE.Group();
    
    // Create a canvas texture for the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw the text on the canvas
    context.font = 'bold 72px Arial';
    context.fillStyle = this.getDamageColor(this.damage);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.damage.toString(), canvas.width / 2, canvas.height / 2);
    
    // Create a texture and sprite from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 1.0
    });
    
    this.textMesh = new THREE.Sprite(material);
    this.textMesh.scale.set(8, 4, 1); // Scale to make it visible
    
    this.sprite.add(this.textMesh);
    this.sprite.position.set(this.position.x, this.position.y, 2); // Place it in front
  }
  
  createLaserDamageCounter() {
    // Similar to bullet damage number but will update over time
    this.sprite = new THREE.Group();
    
    // Create a canvas for the counter
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw initial text
    context.font = 'bold 72px Arial';
    context.fillStyle = this.getDamageColor(this.damage);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.damage.toString(), canvas.width / 2, canvas.height / 2);
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 1.0
    });
    
    this.textMesh = new THREE.Sprite(material);
    this.textMesh.scale.set(8, 4, 1);
    
    this.sprite.add(this.textMesh);
    this.sprite.position.set(this.position.x, this.position.y, 2);
    
    // Store the canvas and context for updates
    this.canvas = canvas;
    this.context = context;
    this.texture = texture;
  }
  
  update(deltaTime) {
    if (!this.isActive) return;
    
    this.time += deltaTime;
    
    if (this.type === 'bullet') {
      // Move upward slightly
      this.position.y += 10 * deltaTime;
      
      // Fade out over time
      if (this.textMesh && this.textMesh.material) {
        this.textMesh.material.opacity = 1.0 - (this.time / this.lifetime);
      }
      
      // Scale up slightly at first, then scale down
      const scale = 1.0 + Math.sin(Math.min(Math.PI, this.time * 5)) * 0.5;
      this.sprite.scale.set(scale, scale, 1);
    } 
    else if (this.type === 'laser') {
      // Keep position above enemy
      // The position will be updated externally when addLaserDamage is called
      
      // Pulse effect
      const pulse = 1.0 + Math.sin(this.time * 10) * 0.1;
      this.sprite.scale.set(pulse, pulse, 1);
    }
    
    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y, 2);
    
    // Remove when lifetime is exceeded
    if (this.time >= this.lifetime) {
      this.remove();
    }
  }
  
  addLaserDamage(amount, position) {
    // Update position to stay above the enemy
    this.position = { ...position };
    this.position.y += 5; // Position slightly above the enemy
    
    // Add to accumulated damage
    this.accumulatedDamage += amount;
    
    // Reset lifetime
    this.time = 0;
    
    // Update the displayed text
    if (this.context && this.canvas && this.texture) {
      // Clear canvas
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Format the damage number - round to 1 decimal place for laser damage
      const displayValue = this.accumulatedDamage >= 10 
        ? Math.round(this.accumulatedDamage) 
        : Math.round(this.accumulatedDamage * 10) / 10;
      
      // Draw updated text
      this.context.font = 'bold 72px Arial';
      this.context.fillStyle = this.getDamageColor(this.accumulatedDamage);
      this.context.textAlign = 'center';
      this.context.textBaseline = 'middle';
      this.context.fillText(displayValue.toString(), this.canvas.width / 2, this.canvas.height / 2);
      
      // Update texture
      this.texture.needsUpdate = true;
      
      // Scale based on damage amount - ensure minimum scale for visibility
      const scaleBase = Math.max(1.0, Math.min(2.0, 1.0 + this.accumulatedDamage / 50));
      this.textMesh.scale.set(8 * scaleBase, 4 * scaleBase, 1);
    }
  }
  
  getDamageColor(damage) {
    // Color based on damage amount - lower thresholds for laser damage
    if (damage >= 30) return '#ff0000'; // Red for high damage
    if (damage >= 10) return '#ff8800'; // Orange for medium
    return '#ffff00'; // Yellow for low damage
  }
  
  remove() {
    // Remove from scene
    if (this.sprite) {
      this.game.scene.remove(this.sprite);
    }
    
    // Mark as inactive
    this.isActive = false;
    
    // Remove from game's damage numbers array
    if (this.game.damageNumbers) {
      const index = this.game.damageNumbers.indexOf(this);
      if (index !== -1) {
        this.game.damageNumbers.splice(index, 1);
      }
    }
    
    // Dispose of resources
    if (this.textMesh && this.textMesh.material) {
      if (this.textMesh.material.map) {
        this.textMesh.material.map.dispose();
      }
      this.textMesh.material.dispose();
    }
  }
} 