import * as THREE from 'three';

export class WeaponModel {
  constructor(type = 0) {
    this.type = type;
    this.sprite = new THREE.Group();
    
    // Create appropriate model based on weapon type
    this.createModel();
  }
  
  createModel() {
    // Remove any existing model parts
    while (this.sprite.children.length > 0) {
      this.sprite.remove(this.sprite.children[0]);
    }
    
    switch(this.type) {
      case 0: // Pistol
        this.createPistolModel();
        break;
      case 1: // Shotgun
        this.createShotgunModel();
        break;
      case 2: // Laser
        this.createLaserModel();
        break;
    }
  }
  
  createPistolModel() {
    // Main body of pistol - simple and compact
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 0.5);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Barrel
    const barrelGeometry = new THREE.BoxGeometry(1.5, 0.4, 0.4);
    const barrelMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(1.75, 0.1, 0);
    
    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.5);
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(-0.5, -0.8, 0);
    
    // Trigger
    const triggerGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
    const triggerMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const trigger = new THREE.Mesh(triggerGeometry, triggerMaterial);
    trigger.position.set(0, -0.3, 0);
    
    // Add all parts to the group
    this.sprite.add(body, barrel, handle, trigger);
  }
  
  createShotgunModel() {
    // Main body - longer than pistol
    const bodyGeometry = new THREE.BoxGeometry(4, 0.8, 0.6);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x553311 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Barrel - wide for shotgun
    const barrelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 3.5, 8);
    barrelGeometry.rotateZ(Math.PI / 2);
    const barrelMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(2, 0, 0);
    
    // Stock
    const stockGeometry = new THREE.BoxGeometry(2, 1.2, 0.5);
    const stockMaterial = new THREE.MeshBasicMaterial({ color: 0x663311 });
    const stock = new THREE.Mesh(stockGeometry, stockMaterial);
    stock.position.set(-2, 0, 0);
    
    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.5);
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x553311 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(-0.5, -0.8, 0);
    
    // Trigger
    const triggerGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
    const triggerMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const trigger = new THREE.Mesh(triggerGeometry, triggerMaterial);
    trigger.position.set(0, -0.3, 0);
    
    // Add all parts to the group
    this.sprite.add(body, barrel, stock, handle, trigger);
  }
  
  createLaserModel() {
    // Main body - high-tech look
    const bodyGeometry = new THREE.BoxGeometry(3, 1.2, 0.8);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x444466 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Barrel/emitter - glowing front
    const emitterGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.8, 8);
    emitterGeometry.rotateZ(Math.PI / 2);
    const emitterMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial);
    emitter.position.set(2, 0, 0);
    
    // Energy cell - glowing element
    const cellGeometry = new THREE.BoxGeometry(1.5, 0.6, 0.7);
    const cellMaterial = new THREE.MeshBasicMaterial({ color: 0x22aaff });
    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
    cell.position.set(0, 0.5, 0);
    
    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.5);
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x333344 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(-0.5, -0.8, 0);
    
    // Trigger
    const triggerGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
    const triggerMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const trigger = new THREE.Mesh(triggerGeometry, triggerMaterial);
    trigger.position.set(0, -0.3, 0);
    
    // Heat sink fins
    for (let i = 0; i < 3; i++) {
      const finGeometry = new THREE.BoxGeometry(0.6, 0.1, 1.2);
      const finMaterial = new THREE.MeshBasicMaterial({ color: 0x333344 });
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      fin.position.set(-1, -0.3 - (i * 0.25), 0);
      this.sprite.add(fin);
    }
    
    // Add energy glow effect
    const glowGeometry = new THREE.CircleGeometry(0.3, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true,
      opacity: 0.7
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(2.5, 0, 0.1);
    
    // Add all parts to the group
    this.sprite.add(body, emitter, cell, handle, trigger, glow);
    
    // Animate the glow
    this.glowPulse = { value: 0 };
    this.glowPulseTween = setInterval(() => {
      this.glowPulse.value += 0.1;
      if (glow.material) {
        glow.material.opacity = 0.5 + Math.sin(this.glowPulse.value) * 0.3;
        emitter.material.color.r = 0.8 + Math.sin(this.glowPulse.value) * 0.2;
      }
    }, 50);
  }
  
  updateType(type) {
    if (this.type !== type) {
      this.type = type;
      this.createModel();
    }
  }
  
  dispose() {
    // Clear any animations
    if (this.glowPulseTween) {
      clearInterval(this.glowPulseTween);
    }
    
    // Remove all geometries and materials
    this.sprite.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
} 