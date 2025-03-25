import * as THREE from 'three';

export class Bullet {
  constructor(x, y, type = 0, angleOffset = 0) {
    // Bullet position
    this.position = { x, y };
    this.type = type;
    
    // Set bullet properties based on type
    switch(type) {
      case 0: // Regular bullet (for pistol and shotgun)
        this.speed = 200;
        this.damage = 10;
        this.drop = 50; // Gravity effect
        break;
      // Other bullet types can be added here
    }
    
    // Apply angle offset (for shotgun spread)
    this.angle = (angleOffset * Math.PI) / 180;
    
    // Create bullet sprite
    this.createSprite();
  }
  
  createSprite() {
    // Create a group for the bullet
    this.sprite = new THREE.Group();
    
    // Core bullet
    const coreGeometry = new THREE.CircleGeometry(0.6, 8); // Increased size from 0.3 to 0.6
    const coreMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff3300,  // Changed from yellow to bright orange-red for better contrast
      transparent: false,
      opacity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.sprite.add(core);
    
    // Add glowing outline
    const glowGeometry = new THREE.CircleGeometry(1.0, 12);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6600, 
      transparent: true,
      opacity: 0.6
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.1; // Place slightly behind core
    this.sprite.add(glow);
    
    // Add bright center
    const centerGeometry = new THREE.CircleGeometry(0.3, 8);
    const centerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,  // Bright white center
      transparent: false
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.z = 0.1; // Place slightly in front of core
    this.sprite.add(center);
    
    // Position bullet
    this.sprite.position.set(this.position.x, this.position.y, 1);
  }
  
  update(deltaTime) {
    // Move bullet forward with some angle
    this.position.x += Math.cos(this.angle) * this.speed * deltaTime;
    this.position.y += Math.sin(this.angle) * this.speed * deltaTime;
    
    // Apply gravity (bullet drop)
    this.position.y -= this.drop * deltaTime * deltaTime;
    
    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y, 1);
    
    // Add pulsing effect to glow
    if (this.sprite.children[1]) {
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
      this.sprite.children[1].scale.set(scale, scale, 1);
    }
  }
} 