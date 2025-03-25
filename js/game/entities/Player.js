import * as THREE from 'three';
import { Bullet } from './Bullet.js';
import { Weapon } from './Weapon.js';
import { Jetpack } from './Jetpack.js';
import { MuzzleFlash } from './MuzzleFlash.js';

export class Player {
  constructor(game) {
    this.game = game;
    
    // Player stats
    this.health = 100;
    this.maxHealth = 100;
    this.isAlive = true;
    
    // Position and movement
    this.position = { x: -40, y: 0 }; // Start on the left side of the screen
    this.velocity = { x: 0, y: 0 };
    this.baseSpeed = 20;
    
    // Jetpack
    this.jetpack = new Jetpack(0); // Start with base model (level 0)
    
    // Weapons
    this.weapons = [
      new Weapon(0), // Pistol
      new Weapon(1), // Shotgun
      new Weapon(2)  // Laser
    ];
    this.currentWeapon = 0;
    
    // Active bullets
    this.bullets = [];
    this.bulletCooldown = 0;
    
    // Create player sprite - stick figure with jetpack
    this.createSprite();
    
    // Add muzzle flash - create it after sprite is created
    console.log('Creating muzzle flash in Player constructor');
    this.muzzleFlash = new MuzzleFlash(game, this.currentWeapon);
  }
  
  createSprite() {
    // Create a group to hold all player parts
    this.sprite = new THREE.Group();
    
    // Create a grid backdrop behind the player
    const gridSize = { width: 10, height: 12 }; // Dimensions to fit behind player
    const gridDivisions = { width: 10, height: 12 }; // 1x1 unit squares
    
    // Create grid material - translucent dark color
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.3
    });
    
    // Create the grid
    const grid = new THREE.Group();
    
    // Add vertical lines
    for (let i = 0; i <= gridDivisions.width; i++) {
      const x = (i / gridDivisions.width) * gridSize.width - gridSize.width / 2;
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -gridSize.height / 2, -0.5),
        new THREE.Vector3(x, gridSize.height / 2, -0.5)
      ]);
      
      const line = new THREE.Line(lineGeometry, gridMaterial);
      grid.add(line);
    }
    
    // Add horizontal lines
    for (let i = 0; i <= gridDivisions.height; i++) {
      const y = (i / gridDivisions.height) * gridSize.height - gridSize.height / 2;
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-gridSize.width / 2, y, -0.5),
        new THREE.Vector3(gridSize.width / 2, y, -0.5)
      ]);
      
      const line = new THREE.Line(lineGeometry, gridMaterial);
      grid.add(line);
    }
    
    // Add grid to sprite at z=-0.5 (behind all other elements)
    this.sprite.add(grid);
    
    // Draw stick figure with thicker lines and black color
    this.stickFigureMaterial = new THREE.LineBasicMaterial({ 
      color: 0x000000,  // Black
      linewidth: 5      // Increased line width for better visibility
    });
    
    // Material for filled parts
    this.blackFillMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    // Add white outline for better visibility against dark backgrounds
    this.outlineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff,
      linewidth: 7,     // Increased outline width
      transparent: true,
      opacity: 0.3
    });
    
    // Body - thinner but still solid
    const bodyGeometry = new THREE.BoxGeometry(0.8, 6, 0.5);
    const body = new THREE.Mesh(bodyGeometry, this.blackFillMaterial);
    
    // Outline for body
    const bodyOutlineGeometry = new THREE.EdgesGeometry(bodyGeometry);
    const bodyOutline = new THREE.LineSegments(bodyOutlineGeometry, this.outlineMaterial);
    
    this.sprite.add(bodyOutline, body);
    
    // Head - make it a bit larger
    const headGeometry = new THREE.CircleGeometry(1.2, 16);
    // Add filled black head
    this.headFillMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const headFill = new THREE.Mesh(
      headGeometry,
      this.headFillMaterial
    );
    headFill.position.y = 4;
    
    const head = new THREE.LineSegments(
      new THREE.EdgesGeometry(headGeometry),
      this.stickFigureMaterial
    );
    head.position.y = 4;
    
    // Head outline
    const headOutline = new THREE.LineSegments(
      new THREE.EdgesGeometry(headGeometry),
      this.outlineMaterial
    );
    headOutline.position.y = 4;
    
    // Create arm group - will be parent to both arms for unified animation
    this.armsGroup = new THREE.Group();
    this.armsGroup.position.set(0.3, 1.5, 0);
    
    // Left arm - positioned for holding a gun with both hands
    const leftArmGeometry = new THREE.CylinderGeometry(0.25, 0.25, 2.5, 8);
    leftArmGeometry.rotateZ(Math.PI / 3); // Angled to hold weapon with both hands
    const leftArm = new THREE.Mesh(leftArmGeometry, this.blackFillMaterial);
    leftArm.position.set(-1.2, 0, 0);
    
    // Left arm outline
    const leftArmOutline = new THREE.LineSegments(
      new THREE.EdgesGeometry(leftArmGeometry),
      this.outlineMaterial
    );
    leftArmOutline.position.copy(leftArm.position);
    
    // Right arm - positioned for holding a gun with both hands
    const rightArmGeometry = new THREE.CylinderGeometry(0.25, 0.25, 2, 8);
    rightArmGeometry.rotateZ(-Math.PI / 3); // Angled to hold weapon with both hands
    const rightArm = new THREE.Mesh(rightArmGeometry, this.blackFillMaterial);
    rightArm.position.set(1.2, -0.2, 0);
    
    // Right arm outline
    const rightArmOutline = new THREE.LineSegments(
      new THREE.EdgesGeometry(rightArmGeometry),
      this.outlineMaterial
    );
    rightArmOutline.position.copy(rightArm.position);
    
    // Add arms to the arms group
    this.armsGroup.add(leftArm, leftArmOutline, rightArm, rightArmOutline);
    
    // Add arms group to sprite
    this.sprite.add(this.armsGroup);
    
    // Legs - make them thicker
    const legsGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2, -5, 0),  // Left foot
      new THREE.Vector3(0, -3, 0),   // Hip
      new THREE.Vector3(2, -5, 0)    // Right foot
    ]);
    const legsOutline = new THREE.Line(legsGeometry, this.outlineMaterial);
    const legs = new THREE.Line(legsGeometry, this.stickFigureMaterial);
    
    // Jetpack - always grey
    this.jetpackMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const jetpackGeometry = new THREE.BoxGeometry(2.5, 4.5, 1); // Slightly larger jetpack
    this.jetpackMesh = new THREE.Mesh(jetpackGeometry, this.jetpackMaterial);
    this.jetpackMesh.position.set(-1.2, 0, -0.5); // Adjusted position
    
    // Create jetpack flames
    this.createJetpackFlames();
    
    // Add all parts to the sprite group
    this.sprite.add(
      headOutline, headFill, head, 
      legs, legsOutline, 
      this.jetpackMesh, this.flame, this.leftFlame, this.rightFlame
    );
    
    // Store references to the body parts for easier access later
    this.bodyParts = {
      stickFigure: [body, head, legs],
      headFill: headFill,
      outlines: [bodyOutline, headOutline, legsOutline],
      jetpack: this.jetpackMesh,
      flame: this.flame,
      leftFlame: this.leftFlame,
      rightFlame: this.rightFlame,
      arms: this.armsGroup
    };
    
    // Add a separate group for the weapon that can be updated
    this.weaponContainer = new THREE.Group();
    this.weaponContainer.position.set(2.2, 0.5, 0.5); // Positioned for two-handed grip
    this.armsGroup.add(this.weaponContainer); // Add weapon to arms so they move together
    
    // Kickback animation properties
    this.kickbackAmount = 0;
    this.isKickingBack = false;
    this.kickbackRecoveryRate = 5; // Higher = faster recovery
    
    // Set initial position
    this.sprite.position.set(this.position.x, this.position.y, 1);
    this.sprite.scale.set(2.2, 2.2, 1); // Increased overall scale from 2 to 2.2
    
    // Add the currently equipped weapon model
    this.updateWeaponModel();
  }
  
  updateWeaponModel() {
    // Clear the weapon container
    while (this.weaponContainer.children.length > 0) {
      this.weaponContainer.remove(this.weaponContainer.children[0]);
    }
    
    // Add current weapon model
    const currentWeapon = this.weapons[this.currentWeapon];
    if (currentWeapon && currentWeapon.model) {
      // Make sure model is updated to the correct type
      currentWeapon.model.updateType(this.currentWeapon);
      
      // Add the model to the weapon container
      this.weaponContainer.add(currentWeapon.model.sprite);
      
      // Scale it appropriately for the player
      currentWeapon.model.sprite.scale.set(0.7, 0.7, 0.7);
      
      // Position adjustments based on weapon type 
      // (minor adjustments to center the weapons properly while keeping arms consistent)
      switch(this.currentWeapon) {
        case 0: // Pistol
          currentWeapon.model.sprite.position.set(0, 0, 0);
          break;
        case 1: // Shotgun
          currentWeapon.model.sprite.position.set(0.5, 0, 0);
          break;
        case 2: // Laser
          currentWeapon.model.sprite.position.set(0.3, 0, 0);
          break;
      }
      
      // Debug log to confirm weapon model is updated
      console.log(`Weapon model updated to: ${['Pistol', 'Shotgun', 'Laser'][this.currentWeapon]}`);
    } else {
      console.warn("Failed to update weapon model - model may be missing");
    }
  }
  
  update(deltaTime) {
    if (!this.isAlive) return;
    
    // Get input
    const input = this.game.inputManager.keys;
    
    // Handle weapon switching
    const previousWeapon = this.currentWeapon;
    if (input.weapon1) this.currentWeapon = 0;
    if (input.weapon2) this.currentWeapon = 1;
    if (input.weapon3) this.currentWeapon = 2;
    
    // Check for empty ammo/charge and auto-switch to pistol if needed
    const weapon = this.weapons[this.currentWeapon];
    if (this.currentWeapon === 1 && weapon.ammo <= 0) { // Shotgun out of ammo
      console.log('Shotgun out of ammo, switching to pistol');
      this.currentWeapon = 0;
      this.muzzleFlash.weaponType = 0;
    } else if (this.currentWeapon === 2 && weapon.charge <= 0) { // Laser out of charge
      console.log('Laser out of charge, switching to pistol');
      this.currentWeapon = 0;
      this.muzzleFlash.weaponType = 0;
    }
    
    // If weapon changed, update the model
    if (previousWeapon !== this.currentWeapon) {
      this.updateWeaponModel();
    }
    
    // Update weapon UI
    const weaponNames = ['Pistol', 'Shotgun', 'Laser'];
    const currentWeapon = this.weapons[this.currentWeapon];
    let ammoText = '';
    
    if (this.currentWeapon === 1) { // Shotgun
      ammoText = ` | Ammo: ${currentWeapon.ammo}/${currentWeapon.maxAmmo}`;
    } else if (this.currentWeapon === 2) { // Laser
      ammoText = ` | Charge: ${Math.round(currentWeapon.charge)}/${currentWeapon.maxCharge}`;
    }
    
    const gunIndicator = document.getElementById('gun-indicator');
    if (gunIndicator) {
      gunIndicator.textContent = `Gun: ${weaponNames[this.currentWeapon]}${ammoText}`;
    } else {
      console.error('Gun indicator element not found!');
    }
    
    // Update jetpack
    this.updateJetpack(deltaTime, input);
    
    // Handle movement
    this.handleMovement(deltaTime, input);
    
    // Handle weapon firing
    this.handleWeaponFiring(deltaTime, input);
    
    // Update bullets
    this.updateBullets(deltaTime);
    
    // Update health bar
    const healthBar = document.getElementById('health-bar');
    if (healthBar) {
      healthBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
    }
    
    // Update fuel bar
    const fuelBar = document.getElementById('fuel-bar');
    if (fuelBar) {
      fuelBar.style.width = `${(this.jetpack.fuel / this.jetpack.maxFuel) * 100}%`;
    }
    
    // Update red outline based on health
    this.updateHealthVisuals();
  }
  
  updateHealthVisuals() {
    // Show red outline only when health is low (below 30%)
    const healthPercentage = this.health / this.maxHealth;
    
    if (healthPercentage < 0.3) {
      // Low health - show red outline with opacity based on health percentage
      // Lower health = more visible outline
      const opacity = 0.8 - (healthPercentage * 1.5); // Range from ~0.35 to 0.8
      
      this.bodyParts.outlines.forEach(outline => {
        outline.material.color.set(0xff0000);
        outline.material.opacity = opacity;
      });
    } else {
      // Normal health - reset to default white outline with low opacity
      this.bodyParts.outlines.forEach(outline => {
        outline.material.color.set(0xffffff);
        outline.material.opacity = 0.3;
      });
    }
  }
  
  updateJetpack(deltaTime, input) {
    // Update animation time
    this.flameAnimationTime += deltaTime * 10;
    
    // Update main flame visibility based on upward thrust
    this.flame.visible = input.up && this.jetpack.fuel > 0;
    
    // Update left/right flame visibility based on horizontal movement
    this.leftFlame.visible = input.right && this.jetpack.fuel > 0;
    this.rightFlame.visible = input.left && this.jetpack.fuel > 0;
    
    // Consume fuel when using jetpack (any direction)
    if ((input.up || input.left || input.right) && this.jetpack.fuel > 0) {
      // Different consumption rates for vertical vs horizontal movement
      let fuelConsumption = 0;
      
      // Apply full consumption rate for upward thrust
      if (input.up) {
        fuelConsumption += this.jetpack.fuelConsumptionRate;
      }
      
      // Apply reduced consumption rate (20%) for horizontal movement
      if (input.left || input.right) {
        fuelConsumption += this.jetpack.fuelConsumptionRate * 0.2;
      }
      
      // Apply fuel consumption
      this.jetpack.fuel = Math.max(0, this.jetpack.fuel - fuelConsumption * deltaTime);
    } else {
      // Regenerate fuel when not thrusting
      this.jetpack.fuel = Math.min(
        this.jetpack.maxFuel, 
        this.jetpack.fuel + this.jetpack.fuelRegenerationRate * deltaTime
      );
    }
    
    // Animate main flame
    if (this.flame.visible) {
      // Pulsing scale effect
      const pulseScale = 0.9 + Math.sin(this.flameAnimationTime * 2) * 0.15;
      const fuelScale = 0.5 + (this.jetpack.fuel / this.jetpack.maxFuel) * 0.5;
      const finalScale = pulseScale * fuelScale;
      
      this.flame.scale.set(finalScale, finalScale * (0.9 + Math.random() * 0.2), finalScale);
      
      // Randomly fluctuate opacity for a more dynamic flame effect
      this.flameMaterial.opacity = 0.7 + Math.random() * 0.3;
      
      // Flicker the core slightly
      this.flameCore.scale.set(
        0.9 + Math.random() * 0.2,
        0.9 + Math.random() * 0.2,
        1
      );
      
      // Apply screen shake based on jetpack level
      if (this.jetpack.screenShakeAmount > 0) {
        this.applyScreenShake(this.jetpack.screenShakeAmount * finalScale);
      }
    }
    
    // Animate left flame
    if (this.leftFlame.visible) {
      // Unique animation for left flame
      const leftPulse = 0.8 + Math.sin(this.flameAnimationTime * 3 + 1) * 0.2;
      const leftFuelScale = 0.6 + (this.jetpack.fuel / this.jetpack.maxFuel) * 0.4;
      const leftFinalScale = leftPulse * leftFuelScale;
      
      this.leftFlame.scale.set(leftFinalScale * (0.9 + Math.random() * 0.2), leftFinalScale, leftFinalScale);
      this.leftFlameMaterial.opacity = 0.7 + Math.random() * 0.3;
      
      // Flicker the core
      this.leftFlameCore.scale.set(
        0.9 + Math.random() * 0.2,
        0.9 + Math.random() * 0.2,
        1
      );
    }
    
    // Animate right flame
    if (this.rightFlame.visible) {
      // Unique animation for right flame
      const rightPulse = 0.8 + Math.cos(this.flameAnimationTime * 2.5 + 2) * 0.2;
      const rightFuelScale = 0.6 + (this.jetpack.fuel / this.jetpack.maxFuel) * 0.4;
      const rightFinalScale = rightPulse * rightFuelScale;
      
      this.rightFlame.scale.set(rightFinalScale * (0.9 + Math.random() * 0.2), rightFinalScale, rightFinalScale);
      this.rightFlameMaterial.opacity = 0.7 + Math.random() * 0.3;
      
      // Flicker the core
      this.rightFlameCore.scale.set(
        0.9 + Math.random() * 0.2,
        0.9 + Math.random() * 0.2,
        1
      );
    }
  }
  
  handleMovement(deltaTime, input) {
    // Calculate speed based on jetpack level
    const speed = this.baseSpeed * (1 + this.jetpack.speedMultiplier);
    
    // Set horizontal velocity
    if (input.left) {
      this.velocity.x = -speed;
    } else if (input.right) {
      this.velocity.x = speed;
    } else {
      // Gradual slowdown when no horizontal input
      this.velocity.x *= 0.9;
    }
    
    // Set vertical velocity
    if (input.up && this.jetpack.fuel > 0) {
      this.velocity.y = speed;
    } else if (input.down) {
      this.velocity.y = -speed;
    } else {
      // Increased gravity when not thrusting upward
      this.velocity.y -= 45 * deltaTime; // Increased from 30 to 45
    }
    
    // Apply velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Screen bounds - get camera bounds
    const halfWidth = this.game.camera.right;
    const halfHeight = this.game.camera.top;
    
    // Restrict player to visible area with some margin
    const margin = 5;
    this.position.x = Math.max(-halfWidth + margin, Math.min(halfWidth - margin, this.position.x));
    this.position.y = Math.max(-halfHeight + margin, Math.min(halfHeight - margin, this.position.y));
    
    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y, 1);
    
    // Tilt the player slightly based on movement
    this.sprite.rotation.z = -this.velocity.x * 0.01;
  }
  
  handleWeaponFiring(deltaTime, input) {
    // Decrease cooldown timer
    if (this.bulletCooldown > 0) {
      this.bulletCooldown -= deltaTime;
    }
    
    // Update kickback animation
    this.updateKickbackAnimation(deltaTime);
    
    // Fire weapon if not on cooldown
    if (input.fire && this.bulletCooldown <= 0) {
      let weapon = this.weapons[this.currentWeapon];
      
      // Check for laser overheat
      if (this.currentWeapon === 2 && weapon.overheated) {
        return;
      }
      
      // Create bullets based on weapon type
      if (this.currentWeapon === 0) { // Pistol
        this.createBullet(0);
        this.bulletCooldown = weapon.fireRate;
        this.triggerKickback(0.3); // Small kickback for pistol
      } else if (this.currentWeapon === 1) { // Shotgun
        // Check if we have ammo
        if (weapon.useAmmo()) {
          // Create multiple bullets in a spread pattern
          // Increased from 5 to 8 pellets (1.6x more), maintaining similar spread
          const numPellets = 8;
          const spreadWidth = 20; // Total spread in degrees
          
          for (let i = 0; i < numPellets; i++) {
            // Calculate angle offset for even distribution across the spread
            const angleOffset = (i / (numPellets - 1) * spreadWidth) - (spreadWidth / 2);
            this.createBullet(0, angleOffset);
          }
          
          this.bulletCooldown = weapon.fireRate;
          this.triggerKickback(0.8); // Large kickback for shotgun
        }
      } else if (this.currentWeapon === 2) { // Laser
        // Use fixed amount of charge per frame when firing
        const chargePerFrame = 10 * deltaTime;
        
        // Check if we have charge - need to handle the case where we run out mid-frame
        if (weapon.charge > 0) {
          // Use as much charge as available, even if less than requested
          weapon.charge = Math.max(0, weapon.charge - chargePerFrame);
          
          // Create laser beam if we still have charge
          if (weapon.charge > 0) {
            this.createLaserBeam();
            
            // Increase heat
            weapon.heat += deltaTime;
            if (weapon.heat >= weapon.maxHeat) {
              weapon.overheated = true;
              setTimeout(() => {
                weapon.overheated = false;
                weapon.heat = 0;
              }, 1000);
            }
            
            // Small continuous kickback for laser
            this.triggerKickback(0.2);
          }
        }
      }
      
      // Add slight recoil
      this.velocity.x -= 5 * deltaTime;
    } else if (!input.fire && this.currentWeapon === 2) {
      // Reset laser heat when not firing
      const weapon = this.weapons[this.currentWeapon];
      weapon.heat = Math.max(0, weapon.heat - deltaTime * 2);
    }
  }
  
  triggerKickback(amount) {
    // Scale up the kickback amounts for more dramatic effect
    const kickAmount = amount * 1.8; // More dramatic kickback
    this.kickbackAmount = kickAmount;
    this.isKickingBack = true;
    
    // Apply immediate kickback to entire arms group
    this.armsGroup.position.x -= kickAmount * 0.5;
    this.armsGroup.rotation.z = kickAmount * 0.15; // Rotate arms for more dramatic effect
    
    // Add slight body tilt for recoil effect
    this.sprite.rotation.z = -kickAmount * 0.1;
  }
  
  updateKickbackAnimation(deltaTime) {
    if (this.isKickingBack) {
      // Gradually recover from kickback
      if (this.kickbackAmount > 0) {
        const recovery = this.kickbackRecoveryRate * deltaTime;
        this.kickbackAmount = Math.max(0, this.kickbackAmount - recovery);
        
        // Update position/rotation to recover from kickback - smoother with easing
        const easing = this.kickbackAmount * this.kickbackAmount; // Quadratic easing
        
        // Recover arms position
        this.armsGroup.position.x = 0.3 - easing * 0.9;
        this.armsGroup.rotation.z = easing * 0.15;
        
        // Recover body tilt
        this.sprite.rotation.z = -easing * 0.1;
        
        // Reset when fully recovered
        if (this.kickbackAmount === 0) {
          this.isKickingBack = false;
          this.armsGroup.position.x = 0.3;
          this.armsGroup.rotation.z = 0;
        }
      }
    }
  }
  
  applyScreenShake(intensity) {
    // Store original camera position
    const originalPosition = {
      x: this.game.camera.position.x,
      y: this.game.camera.position.y
    };
    
    // Apply random shake
    const shake = () => {
      const xShake = (Math.random() - 0.5) * intensity * 2;
      const yShake = (Math.random() - 0.5) * intensity * 2;
      this.game.camera.position.x = originalPosition.x + xShake;
      this.game.camera.position.y = originalPosition.y + yShake;
    };
    
    // Shake for a short duration with decreasing intensity
    let duration = 0;
    const interval = setInterval(() => {
      duration += 20;
      if (duration > 200) {
        clearInterval(interval);
        // Reset camera position
        this.game.camera.position.x = originalPosition.x;
        this.game.camera.position.y = originalPosition.y;
      } else {
        // Decrease intensity over time
        const remainingIntensity = intensity * (1 - duration/200);
        shake(remainingIntensity);
      }
    }, 20);
  }
  
  switchWeapon() {
    // Cycle to next weapon
    this.currentWeapon = (this.currentWeapon + 1) % this.weapons.length;
    
    // Update weapon model
    this.updateWeaponModel();
    
    // Update muzzle flash weapon type
    this.muzzleFlash.weaponType = this.currentWeapon;
    
    // Reset cooldown
    this.bulletCooldown = 0;
  }
  
  createBullet(type, angleOffset = 0) {
    // Get barrel end position based on weapon type
    let barrelEndPos = { x: 0, y: 0 };
    
    switch(this.currentWeapon) {
      case 0: // Pistol
        barrelEndPos = { x: 9.0, y: 3.1 }; // Moved right 2 units
        break;
      case 1: // Shotgun
        barrelEndPos = { x: 10.5, y: 4 }; // Moved right 2 units
        break;
      case 2: // Laser
        barrelEndPos = { x: 9.5, y: 3.5 }; // Moved right 2 units
        break;
    }
    
    // Convert local coordinates to world coordinates
    const modelScale = 0.7;
    
    // Get weapon position within the weapon container
    let weaponOffset = { x: 0, y: 0 };
    switch(this.currentWeapon) {
      case 0: // Pistol
        weaponOffset = { x: 0, y: 0 };
        break;
      case 1: // Shotgun
        weaponOffset = { x: 0.5, y: 0 };
        break;
      case 2: // Laser
        weaponOffset = { x: 0.3, y: 0 };
        break;
    }
    
    // Calculate final barrel position in world space
    const weaponContainerPos = this.weaponContainer.position;
    const armsGroupPos = this.armsGroup.position;
    
    const finalX = this.position.x + 
                   armsGroupPos.x + 
                   weaponContainerPos.x + 
                   weaponOffset.x + 
                   (barrelEndPos.x * modelScale);
                   
    const finalY = this.position.y + 
                   armsGroupPos.y + 
                   weaponContainerPos.y + 
                   weaponOffset.y + 
                   (barrelEndPos.y * modelScale);
    
    console.log('=== BULLET DEBUG ===');
    console.log('Creating bullet at position:', { finalX, finalY });
    console.log('Muzzle flash exists:', !!this.muzzleFlash);
    
    // Create muzzle flash at barrel position
    if (this.muzzleFlash) {
      console.log('Creating muzzle flash at barrel position');
      this.muzzleFlash.createFlash(finalX, finalY, 1); // Changed z to 1 to ensure visibility
    } else {
      console.error('Muzzle flash is null!');
    }
    
    // Create a bullet at the barrel position
    const bullet = new Bullet(
      finalX,
      finalY,
      type,
      angleOffset
    );
    
    // Add to scene
    this.game.scene.add(bullet.sprite);
    
    // Add to bullets array
    this.bullets.push(bullet);
  }
  
  createLaserBeam() {
    // Remove any existing laser beam
    this.removeLaserBeam();
    
    // Get barrel end position for the laser
    const barrelEndPos = { x: 9.5, y: 3.5 }; // Moved right 2 units
    
    // Convert local coordinates to world coordinates
    const modelScale = 0.7;
    const weaponOffset = { x: 0.3, y: 0 };
    
    // Calculate final barrel position in world space
    const weaponContainerPos = this.weaponContainer.position;
    const armsGroupPos = this.armsGroup.position;
    
    const startX = this.position.x + 
                  armsGroupPos.x + 
                  weaponContainerPos.x + 
                  weaponOffset.x + 
                  (barrelEndPos.x * modelScale);
                  
    const startY = this.position.y + 
                  armsGroupPos.y + 
                  weaponContainerPos.y + 
                  weaponOffset.y + 
                  (barrelEndPos.y * modelScale);
    
    // Create muzzle flash at barrel position
    if (this.muzzleFlash) {
      console.log('Creating laser muzzle flash at barrel position');
      this.muzzleFlash.createFlash(startX, startY, 1);
    } else {
      console.error('Muzzle flash is null!');
    }
    
    // Calculate endpoint - stretch to the edge of the screen
    const rightEdge = this.game.camera.right;
    
    // Create a group for the laser
    this.laserBeam = new THREE.Group();
    
    // Create the main laser beam
    const laserMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff0000,
      linewidth: 3
    });
    
    const laserGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(startX, startY, 1),
      new THREE.Vector3(rightEdge, startY, 1)
    ]);
    
    const mainBeam = new THREE.Line(laserGeometry, laserMaterial);
    this.laserBeam.add(mainBeam);
    
    // Add a wider, translucent glow around the beam
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      transparent: true,
      opacity: 0.3
    });
    
    // Create a plane for the glow
    const beamLength = rightEdge - startX;
    const glowGeometry = new THREE.PlaneGeometry(beamLength, 1.5);
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    
    // Position the glow mesh - the plane needs to be positioned at its center
    glowMesh.position.set(
      startX + beamLength/2, 
      startY, 
      0.5
    );
    
    this.laserBeam.add(glowMesh);
    
    // Add pulsing core of the laser
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    
    const coreGeometry = new THREE.PlaneGeometry(beamLength, 0.5);
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    
    coreMesh.position.set(
      startX + beamLength/2, 
      startY, 
      0.6
    );
    
    this.laserBeam.add(coreMesh);
    
    // Add to scene
    this.game.scene.add(this.laserBeam);
    
    // Animate the laser core
    this.laserPulseTime = 0;
    this.laserPulseInterval = setInterval(() => {
      this.laserPulseTime += 0.1;
      if (coreMesh && coreMesh.material) {
        coreMesh.material.opacity = 0.5 + Math.sin(this.laserPulseTime * 10) * 0.3;
      }
    }, 20);
    
    // Add collision detection for the laser
    this.laserActive = true;
  }
  
  removeLaserBeam() {
    if (this.laserBeam) {
      this.game.scene.remove(this.laserBeam);
      this.laserBeam = null;
      this.laserActive = false;
      
      // Clear the pulse animation
      if (this.laserPulseInterval) {
        clearInterval(this.laserPulseInterval);
        this.laserPulseInterval = null;
      }
    }
  }
  
  updateBullets(deltaTime) {
    // Update each bullet
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Update bullet position
      bullet.update(deltaTime);
      
      // Check if bullet is out of bounds
      if (bullet.position.x > this.game.camera.right ||
          bullet.position.x < this.game.camera.left ||
          bullet.position.y > this.game.camera.top ||
          bullet.position.y < this.game.camera.bottom) {
        // Remove bullet from scene
        this.game.scene.remove(bullet.sprite);
        
        // Remove from bullets array
        this.bullets.splice(i, 1);
      }
    }
    
    // Remove laser beam if weapon is not laser or not firing
    if (this.currentWeapon !== 2 || !this.game.inputManager.keys.fire) {
      this.removeLaserBeam();
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    
    // Visual feedback - flash player red but don't change the persistent outline
    // Store original colors
    const originalColors = this.bodyParts.outlines.map(outline => ({
      color: outline.material.color.clone(),
      opacity: outline.material.opacity
    }));
    
    // Flash all outlines bright red
    this.bodyParts.outlines.forEach(outline => {
      outline.material.color.set(0xff0000);
      outline.material.opacity = 0.9; // Fully visible for the flash
    });
    
    // Reset colors after a short time
    setTimeout(() => {
      // Reset to stored colors
      this.bodyParts.outlines.forEach((outline, index) => {
        outline.material.color.copy(originalColors[index].color);
        outline.material.opacity = originalColors[index].opacity;
      });
      
      // Update health visuals for persistent state
      this.updateHealthVisuals();
    }, 100);
    
    // Check if player is dead
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }
  
  die() {
    this.isAlive = false;
    
    // Visual effect - fall off screen
    this.velocity.y = -30;
    
    // Trigger game over after a short delay
    setTimeout(() => {
      this.game.gameOver();
    }, 1000);
  }
  
  upgradeJetpack(level) {
    this.jetpack.upgrade(level);
    
    // Update jetpack size based on level
    const scale = 1 + level * 0.5;
    this.jetpackMesh.scale.set(scale, scale, 1);
  }
  
  reset() {
    // Reset player stats
    this.health = this.maxHealth;
    this.isAlive = true;
    
    // Reset position
    this.position = { x: -40, y: 0 };
    this.velocity = { x: 0, y: 0 };
    
    // Reset jetpack
    this.jetpack.reset();
    this.jetpackMesh.scale.set(1, 1, 1);
    
    // Reset flame animation
    this.flame.visible = false;
    this.leftFlame.visible = false;
    this.rightFlame.visible = false;
    this.flame.scale.set(1, 1, 1);
    this.leftFlame.scale.set(1, 1, 1);
    this.rightFlame.scale.set(1, 1, 1);
    this.flameAnimationTime = 0;
    
    // Reset kickback animation
    this.kickbackAmount = 0;
    this.isKickingBack = false;
    this.armsGroup.position.x = 0.3;
    this.armsGroup.rotation.z = 0;
    
    // Reset weapons
    this.currentWeapon = 0;
    this.weapons.forEach(weapon => weapon.reset());
    this.updateWeaponModel();
    
    // Clear bullets
    this.bullets.forEach(bullet => this.game.scene.remove(bullet.sprite));
    this.bullets = [];
    
    // Remove laser beam
    this.removeLaserBeam();
    
    // Reset outline color to default white with low opacity
    this.bodyParts.outlines.forEach(outline => {
      outline.material.color.set(0xffffff);
      outline.material.opacity = 0.3;
    });
    
    // Reset sprite position and rotation 
    this.sprite.position.set(this.position.x, this.position.y, 1);
    this.sprite.rotation.z = 0;
    
    // Reset camera position (in case of screen shake)
    this.game.camera.position.x = 0;
    this.game.camera.position.y = 0;
    this.game.camera.position.z = 10;
    
    // Reset muzzle flash
    this.muzzleFlash.removeFlash();
    
    // Force update the sprite to correct position
    this.update(0.01);
  }
  
  createJetpackFlames() {
    // Main thrust flame (downward, for vertical movement)
    const flameGeometry = new THREE.ConeGeometry(1.2, 4, 12);
    this.flameMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6000,
      transparent: true,
      opacity: 0.9
    });
    this.flame = new THREE.Mesh(flameGeometry, this.flameMaterial);
    this.flame.position.set(-1.2, -4, -0.5);
    this.flame.rotation.x = Math.PI; // Point downward
    this.flame.visible = false;
    
    // Inner core for main flame (brighter center)
    const coreGeometry = new THREE.ConeGeometry(0.6, 3, 8);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.9
    });
    this.flameCore = new THREE.Mesh(coreGeometry, coreMaterial);
    this.flameCore.position.set(0, 0.5, 0);
    this.flame.add(this.flameCore);
    
    // Left side thrust (for right movement)
    const leftFlameGeometry = new THREE.ConeGeometry(0.8, 3, 8);
    this.leftFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.9
    });
    this.leftFlame = new THREE.Mesh(leftFlameGeometry, this.leftFlameMaterial);
    this.leftFlame.position.set(-2.2, -1, -0.5);
    this.leftFlame.rotation.z = Math.PI / 2; // Point left
    this.leftFlame.visible = false;
    
    // Inner core for left flame
    const leftCoreGeometry = new THREE.ConeGeometry(0.4, 2, 6);
    const leftCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.9
    });
    this.leftFlameCore = new THREE.Mesh(leftCoreGeometry, leftCoreMaterial);
    this.leftFlameCore.position.set(0.5, 0, 0);
    this.leftFlame.add(this.leftFlameCore);
    
    // Right side thrust (for left movement)
    const rightFlameGeometry = new THREE.ConeGeometry(0.8, 3, 8);
    this.rightFlameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.9
    });
    this.rightFlame = new THREE.Mesh(rightFlameGeometry, this.rightFlameMaterial);
    this.rightFlame.position.set(-0.2, -1, -0.5);
    this.rightFlame.rotation.z = -Math.PI / 2; // Point right
    this.rightFlame.visible = false;
    
    // Inner core for right flame
    const rightCoreGeometry = new THREE.ConeGeometry(0.4, 2, 6);
    const rightCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.9
    });
    this.rightFlameCore = new THREE.Mesh(rightCoreGeometry, rightCoreMaterial);
    this.rightFlameCore.position.set(0.5, 0, 0);
    this.rightFlame.add(this.rightFlameCore);
    
    // Initialize animation properties
    this.flameAnimationTime = 0;
  }
} 