import { DamageNumber } from './entities/DamageNumber.js';

export class CollisionManager {
  constructor() {
    this.comboTimer = 0;
    this.comboCount = 0;
    this.comboTimeout = 2; // seconds
  }
  
  checkCollisions(game) {
    // Update combo timer
    if (this.comboCount > 0) {
      this.comboTimer += game.clock.getDelta();
      
      if (this.comboTimer >= this.comboTimeout) {
        this.comboTimer = 0;
        this.comboCount = 0;
      }
    }
    
    // Check player bullets against enemies
    this.checkBulletEnemyCollisions(game);
    
    // Check laser beam against enemies
    if (game.player.laserActive) {
      this.checkLaserEnemyCollisions(game);
    }
    
    // Check enemy projectiles against player
    this.checkProjectilePlayerCollisions(game);
    
    // Check enemy-player collisions
    this.checkEnemyPlayerCollisions(game);
    
    // Check power-ups
    this.checkPowerUpCollisions(game);
  }
  
  checkBulletEnemyCollisions(game) {
    const player = game.player;
    const enemies = game.enemyManager.enemies;
    
    // Check each bullet
    for (let i = player.bullets.length - 1; i >= 0; i--) {
      const bullet = player.bullets[i];
      let hit = false;
      
      // Check against each enemy
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        
        // Simple distance-based collision
        const dx = bullet.position.x - enemy.position.x;
        const dy = bullet.position.y - enemy.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use the core bullet radius for collision (slightly larger than before)
        const bulletRadius = 0.8; // Estimate of the core bullet size
        
        // Check if bullet hit enemy
        if (distance < enemy.size + bulletRadius) {
          hit = true;
          
          // Deal damage to enemy
          enemy.takeDamage(bullet.damage);
          
          // Create damage number at hit position
          new DamageNumber(
            game, 
            enemy.position.x, 
            enemy.position.y + enemy.size/2, 
            bullet.damage,
            'bullet'
          );
          
          // Increment combo
          this.comboCount++;
          this.comboTimer = 0;
          
          // Add combo bonus if applicable
          if (this.comboCount > 1) {
            game.addScore(5 * (this.comboCount - 1));
          }
          
          break;
        }
      }
      
      // Remove bullet if it hit something
      if (hit) {
        game.scene.remove(bullet.sprite);
        player.bullets.splice(i, 1);
      }
    }
  }
  
  checkLaserEnemyCollisions(game) {
    const player = game.player;
    const enemies = game.enemyManager.enemies;
    const laserY = player.position.y + 1; // Laser beam y-position
    const laserWidth = game.camera.right - player.position.x; // Beam extends to right edge
    
    // Check each enemy for intersection with laser beam
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      
      // Check if enemy is in front of player
      if (enemy.position.x > player.position.x) {
        // Check if enemy's y position is within laser height
        const dy = Math.abs(enemy.position.y - laserY);
        
        if (dy < enemy.size) {
          // Get weapon damage - fixed amount per frame for more consistent numbers
          const weapon = player.weapons[2]; // Laser weapon
          const damageAmount = weapon.damage * 0.1; // Apply 10% of damage per tick for consistent numbers
          
          // Enemy hit by laser
          enemy.takeDamage(damageAmount);
          
          // Check if enemy already has a laser damage counter
          let hasCounter = false;
          if (game.damageNumbers) {
            for (const damageNumber of game.damageNumbers) {
              if (damageNumber.type === 'laser' && 
                  Math.abs(damageNumber.position.x - enemy.position.x) < enemy.size &&
                  Math.abs(damageNumber.position.y - enemy.position.y) < enemy.size * 2) {
                // Update existing counter
                damageNumber.addLaserDamage(damageAmount, {
                  x: enemy.position.x,
                  y: enemy.position.y + enemy.size
                });
                hasCounter = true;
                break;
              }
            }
          }
          
          // Create new counter if needed
          if (!hasCounter) {
            new DamageNumber(
              game,
              enemy.position.x,
              enemy.position.y + enemy.size,
              damageAmount,
              'laser'
            );
          }
          
          // Increment combo
          this.comboCount++;
          this.comboTimer = 0;
          
          // Add combo bonus if applicable
          if (this.comboCount > 1) {
            game.addScore(5 * (this.comboCount - 1));
          }
        }
      }
    }
  }
  
  checkProjectilePlayerCollisions(game) {
    const player = game.player;
    
    // Skip if player is invulnerable or has shield
    if (!player.isAlive || player.isShielded) return;
    
    // Check each enemy with projectiles
    for (const enemy of game.enemyManager.enemies) {
      if (!enemy.projectiles) continue;
      
      // Check each projectile
      for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
        const projectile = enemy.projectiles[i];
        
        // Simple distance-based collision
        const dx = projectile.position.x - player.position.x;
        const dy = projectile.position.y - player.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if projectile hit player
        if (distance < 4) { // Player hitbox
          // Remove projectile
          game.scene.remove(projectile.sprite);
          
          // Remove from global projectiles collection
          const globalIndex = game.enemyManager.allProjectiles.indexOf(projectile);
          if (globalIndex !== -1) {
            game.enemyManager.allProjectiles.splice(globalIndex, 1);
          }
          
          enemy.projectiles.splice(i, 1);
          
          // Damage player
          player.takeDamage(projectile.damage);
          
          // Reset combo
          this.comboCount = 0;
          this.comboTimer = 0;
        }
      }
    }
  }
  
  checkEnemyPlayerCollisions(game) {
    const player = game.player;
    const enemies = game.enemyManager.enemies;
    
    // Skip if player is invulnerable or has shield
    if (!player.isAlive) return;
    
    // Check each enemy
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      
      // Simple distance-based collision
      const dx = enemy.position.x - player.position.x;
      const dy = enemy.position.y - player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if enemy hit player
      if (distance < enemy.size + 2) { // Player hitbox + enemy size
        if (player.isShielded) {
          // Shield blocks damage and destroys enemy
          enemy.takeDamage(enemy.health);
        } else {
          // Deal damage to player
          player.takeDamage(enemy.damage);
          
          // Knockback effect
          player.velocity.x -= 30;
          player.velocity.y += (player.position.y < enemy.position.y) ? -10 : 10;
          
          // Deal damage to enemy (ramming)
          enemy.takeDamage(20);
          
          // Reset combo
          this.comboCount = 0;
          this.comboTimer = 0;
        }
      }
    }
  }
  
  checkPowerUpCollisions(game) {
    if (!game.powerUps || !game.player.isAlive) return;
    
    const player = game.player;
    
    // For each power up, check if the player has collected it
    for (let i = game.powerUps.length - 1; i >= 0; i--) {
      const powerUp = game.powerUps[i];
      
      // Skip if already collected
      if (powerUp.isCollected) continue;
      
      // Check collision
      const dx = player.position.x - powerUp.position.x;
      const dy = player.position.y - powerUp.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Use a larger collision radius for easier pickup
      if (distance < 10) {
        powerUp.collect();
      }
    }
  }
} 