spawnPowerUp(x, y) {
  // Randomly choose power-up type with weighted probabilities
  const rand = Math.random();
  let type;
  
  if (rand < 0.4) { // 40% chance for health
    type = 0;
  } else if (rand < 0.7) { // 30% chance for fuel
    type = 1;
  } else if (rand < 0.85) { // 15% chance for shotgun ammo
    type = 2;
  } else if (rand < 0.95) { // 10% chance for laser charge
    type = 3;
  } else { // 5% chance for jetpack upgrade
    type = 4;
  }
  
  // Create power-up
  const powerUp = new PowerUp(x, y, type);
  this.powerUps.push(powerUp);
  this.game.scene.add(powerUp.sprite);
} 