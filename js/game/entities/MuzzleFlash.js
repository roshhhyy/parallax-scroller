import * as THREE from 'three';

export class MuzzleFlash {
  constructor(game, weaponType) {
    this.game = game;
    this.weaponType = weaponType;
    this.flashGroup = null;
    this.isActive = false;
    console.log('MuzzleFlash constructor called with weaponType:', weaponType);
  }

  createFlash(x, y, z) {
    console.log('=== MUZZLE FLASH DEBUG ===');
    console.log('Creating muzzle flash at:', { x, y, z });
    console.log('Current weapon type:', this.weaponType);
    console.log('Scene exists:', !!this.game.scene);
    
    // Remove any existing flash
    this.removeFlash();

    // Create a group for the flash
    this.flashGroup = new THREE.Group();
    this.flashGroup.position.set(x, y, z);

    switch(this.weaponType) {
      case 0: // Pistol
        this.createPistolFlash();
        break;
      case 1: // Shotgun
        this.createShotgunFlash();
        break;
      case 2: // Laser
        this.createLaserFlash();
        break;
    }

    // Add to scene
    if (this.game.scene) {
      this.game.scene.add(this.flashGroup);
      this.isActive = true;
      console.log('Muzzle flash added to scene successfully');
      console.log('Flash group position:', this.flashGroup.position);
      console.log('Flash group parent:', this.flashGroup.parent);
    } else {
      console.error('Failed to add muzzle flash - scene is null!');
    }

    // Remove after duration
    setTimeout(() => {
      console.log('Removing muzzle flash after timeout');
      this.removeFlash();
    }, 50);
  }

  createPistolFlash() {
    // Main flash - bright orange
    const mainFlash = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 1
      })
    );
    mainFlash.rotation.z = Math.PI / 4; // 45 degrees

    // White core
    const core = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1
      })
    );
    core.rotation.z = Math.PI / 4;

    // Add small sparks
    for (let i = 0; i < 4; i++) {
      const spark = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.8),
        new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.8
        })
      );
      const angle = (i * Math.PI / 2) + Math.PI / 4;
      const distance = 1.5;
      spark.position.set(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        0
      );
      this.flashGroup.add(spark);
    }

    this.flashGroup.add(mainFlash, core);
  }

  createShotgunFlash() {
    // Main flash - bright orange
    const mainFlash = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 1
      })
    );
    mainFlash.rotation.z = Math.PI / 4;

    // White core
    const core = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1
      })
    );
    core.rotation.z = Math.PI / 4;

    // Add more sparks in a wider spread
    for (let i = 0; i < 6; i++) {
      const spark = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.8
        })
      );
      const angle = (i * Math.PI / 3) + Math.PI / 4;
      const distance = 2;
      spark.position.set(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        0
      );
      this.flashGroup.add(spark);
    }

    this.flashGroup.add(mainFlash, core);
  }

  createLaserFlash() {
    // Main flash - bright red
    const mainFlash = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 4),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 1
      })
    );
    mainFlash.rotation.z = Math.PI / 2; // Vertical orientation

    // White core
    const core = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 2),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1
      })
    );
    core.rotation.z = Math.PI / 2;

    // Add energy particles
    for (let i = 0; i < 3; i++) {
      const particle = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.8),
        new THREE.MeshBasicMaterial({
          color: 0xff00ff,
          transparent: true,
          opacity: 0.8
        })
      );
      particle.position.set(0, -1 + i, 0);
      this.flashGroup.add(particle);
    }

    this.flashGroup.add(mainFlash, core);
  }

  removeFlash() {
    if (this.isActive && this.flashGroup && this.flashGroup.parent) {
      console.log('Removing muzzle flash from scene');
      this.game.scene.remove(this.flashGroup);
      this.isActive = false;
      
      // Clean up geometries and materials
      this.flashGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });
    }
  }
} 