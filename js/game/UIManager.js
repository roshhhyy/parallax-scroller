export class UIManager {
  constructor() {
    // Get UI elements
    this.scoreElement = document.getElementById('score');
    this.gunIndicator = document.getElementById('gun-indicator');
    this.healthBar = document.getElementById('health-bar');
    this.fuelBar = document.getElementById('fuel-bar');
    
    // Create game over screen (hidden initially)
    this.createGameOverScreen();
    
    // Create debug UI for backgrounds and day/night cycle
    this.createDebugUI();
    
    // Create powerup key/legend
    this.createPowerUpKey();
  }
  
  createGameOverScreen() {
    // Create game over container
    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.id = 'game-over';
    this.gameOverScreen.style.position = 'absolute';
    this.gameOverScreen.style.top = '50%';
    this.gameOverScreen.style.left = '50%';
    this.gameOverScreen.style.transform = 'translate(-50%, -50%)';
    this.gameOverScreen.style.color = '#000';
    this.gameOverScreen.style.textAlign = 'center';
    this.gameOverScreen.style.fontFamily = 'Arial, sans-serif';
    this.gameOverScreen.style.display = 'none';
    this.gameOverScreen.style.zIndex = '100';
    
    // Game over title
    const title = document.createElement('h1');
    title.textContent = 'GAME OVER';
    title.style.fontSize = '48px';
    title.style.marginBottom = '20px';
    this.gameOverScreen.appendChild(title);
    
    // Score display
    this.finalScoreElement = document.createElement('p');
    this.finalScoreElement.style.fontSize = '24px';
    this.finalScoreElement.style.marginBottom = '30px';
    this.gameOverScreen.appendChild(this.finalScoreElement);
    
    // Restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'PLAY AGAIN';
    restartButton.style.backgroundColor = '#ff3030';
    restartButton.style.color = '#fff';
    restartButton.style.border = 'none';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '20px';
    restartButton.style.cursor = 'pointer';
    restartButton.style.marginTop = '20px';
    restartButton.style.borderRadius = '5px';
    
    // Hover effect
    restartButton.addEventListener('mouseover', () => {
      restartButton.style.backgroundColor = '#ff5050';
    });
    
    restartButton.addEventListener('mouseout', () => {
      restartButton.style.backgroundColor = '#ff3030';
    });
    
    // Add restart click handler
    restartButton.addEventListener('click', () => {
      this.hideGameOver();
      // This will be connected to the game in the showGameOver method
    });
    
    this.gameOverScreen.appendChild(restartButton);
    this.restartButton = restartButton;
    
    // Add to body
    document.body.appendChild(this.gameOverScreen);
  }
  
  createDebugUI() {
    // Debug container
    this.debugUI = document.createElement('div');
    this.debugUI.style.position = 'absolute';
    this.debugUI.style.bottom = '10px';
    this.debugUI.style.right = '10px';
    this.debugUI.style.display = 'flex';
    this.debugUI.style.flexDirection = 'column';
    this.debugUI.style.gap = '5px';
    this.debugUI.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.debugUI.style.padding = '10px';
    this.debugUI.style.borderRadius = '5px';
    this.debugUI.style.zIndex = '10';
    
    // Create biome buttons container
    const biomeContainer = document.createElement('div');
    biomeContainer.style.display = 'flex';
    biomeContainer.style.gap = '5px';
    biomeContainer.style.marginBottom = '5px';
    this.debugUI.appendChild(biomeContainer);
    
    // Create day/night buttons container
    const timeContainer = document.createElement('div');
    timeContainer.style.display = 'flex';
    timeContainer.style.gap = '5px';
    this.debugUI.appendChild(timeContainer);
    
    // Biome button icons and labels
    const biomes = [
      { name: 'City', icon: '🏙️', color: '#4488ff' },
      { name: 'Farm', icon: '🌾', color: '#88cc44' },
      { name: 'Ocean', icon: '🌊', color: '#44aadd' },
      { name: 'Jungle', icon: '🌴', color: '#44aa44' },
    ];
    
    // Time button icons and labels
    const times = [
      { name: 'Day', icon: '☀️', color: '#ffcc44' },
      { name: 'Night', icon: '🌙', color: '#444499' },
    ];
    
    // Create biome buttons
    biomes.forEach((biome, index) => {
      const button = this.createDebugButton(biome.icon, biome.name, biome.color);
      button.onclick = () => {
        // Get the game instance via reference
        const game = this.gameRef;
        if (game) {
          game.currentBiome = index;
          game.background.setBiome(index, game.dayNightCycle.isNight);
          this.highlightButton(button, biomeContainer);
        }
      };
      biomeContainer.appendChild(button);
    });
    
    // Create day/night buttons
    times.forEach((time, index) => {
      const button = this.createDebugButton(time.icon, time.name, time.color);
      button.onclick = () => {
        // Get the game instance via reference
        const game = this.gameRef;
        if (game) {
          game.dayNightCycle.isNight = (index === 1);
          game.dayNightCycle.transitionToTimeOfDay(index === 1);
          game.background.setBiome(game.currentBiome, game.dayNightCycle.isNight);
          this.highlightButton(button, timeContainer);
        }
      };
      timeContainer.appendChild(button);
    });
    
    // Add to body
    document.body.appendChild(this.debugUI);
  }
  
  createDebugButton(icon, label, color) {
    const button = document.createElement('button');
    button.innerHTML = `${icon}<br>${label}`;
    button.style.width = '60px';
    button.style.height = '60px';
    button.style.fontSize = '12px';
    button.style.backgroundColor = color;
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.flexDirection = 'column';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    button.dataset.label = label;
    return button;
  }
  
  highlightButton(selectedButton, container) {
    // Highlight the selected button
    Array.from(container.children).forEach(button => {
      button.style.opacity = '0.7';
      button.style.transform = 'scale(1)';
    });
    selectedButton.style.opacity = '1';
    selectedButton.style.transform = 'scale(1.1)';
  }
  
  setGameReference(game) {
    this.gameRef = game;
  }
  
  update(game) {
    // Update health bar
    const healthPercent = (game.player.health / game.player.maxHealth) * 100;
    this.healthBar.style.width = `${healthPercent}%`;
    
    // Update fuel bar
    const fuelPercent = (game.player.jetpack.fuel / game.player.jetpack.maxFuel) * 100;
    this.fuelBar.style.width = `${Math.min(100, fuelPercent)}%`;
    
    // Update gun indicator
    const weaponNames = ['Pistol', 'Shotgun', 'Laser'];
    const currentWeapon = game.player.weapons[game.player.currentWeapon];
    let ammoText = '';
    
    if (game.player.currentWeapon === 1) { // Shotgun
      ammoText = ` | Ammo: ${currentWeapon.ammo}/${currentWeapon.maxAmmo}`;
    } else if (game.player.currentWeapon === 2) { // Laser
      ammoText = ` | Charge: ${Math.round(currentWeapon.charge)}/${currentWeapon.maxCharge}`;
    }
    
    this.gunIndicator.textContent = `Gun: ${weaponNames[game.player.currentWeapon]}${ammoText}`;
  }
  
  updateScore(score) {
    this.scoreElement.textContent = `Score: ${score}`;
  }
  
  showGameOver(score) {
    // Update final score
    this.finalScoreElement.textContent = `Final Score: ${score}`;
    
    // Set restart handler
    this.restartHandler = () => {
      // This will be set by the Game instance
    };
    
    // Show screen
    this.gameOverScreen.style.display = 'block';
  }
  
  hideGameOver() {
    this.gameOverScreen.style.display = 'none';
    
    // Call restart handler
    if (this.restartHandler) {
      this.restartHandler();
    }
  }
  
  reset() {
    this.updateScore(0);
  }
  
  createPowerUpKey() {
    // PowerUp key container
    this.powerUpKey = document.createElement('div');
    this.powerUpKey.style.position = 'absolute';
    this.powerUpKey.style.top = '10px';
    this.powerUpKey.style.right = '10px';
    this.powerUpKey.style.display = 'flex';
    this.powerUpKey.style.flexDirection = 'column';
    this.powerUpKey.style.gap = '8px';
    this.powerUpKey.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    this.powerUpKey.style.padding = '10px';
    this.powerUpKey.style.borderRadius = '5px';
    this.powerUpKey.style.zIndex = '10';
    this.powerUpKey.style.fontFamily = 'Arial, sans-serif';
    this.powerUpKey.style.fontSize = '12px';
    this.powerUpKey.style.color = 'white';
    this.powerUpKey.style.width = '180px';
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'POWER-UPS';
    title.style.fontWeight = 'bold';
    title.style.textAlign = 'center';
    title.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
    title.style.paddingBottom = '5px';
    title.style.marginBottom = '5px';
    this.powerUpKey.appendChild(title);
    
    // Define powerup info
    const powerUps = [
      {
        name: 'Health',
        icon: '❤️',
        color: '#ff3333',
        description: 'Restores 25 HP'
      },
      {
        name: 'Fuel',
        icon: '⚡',
        color: '#33aaff',
        description: 'Refills jetpack'
      },
      {
        name: 'Shield',
        icon: '🛡️',
        color: '#ffcc33',
        description: 'Temporary invulnerability'
      },
      {
        name: 'Overdrive',
        icon: '⭐',
        color: '#ff9933',
        description: 'Doubles weapon fire rate'
      }
    ];
    
    // Create power up entries
    powerUps.forEach(powerUp => {
      const entry = document.createElement('div');
      entry.style.display = 'flex';
      entry.style.alignItems = 'center';
      entry.style.gap = '8px';
      
      // Create icon with color
      const icon = document.createElement('div');
      icon.textContent = powerUp.icon;
      icon.style.width = '24px';
      icon.style.height = '24px';
      icon.style.backgroundColor = powerUp.color;
      icon.style.borderRadius = '50%';
      icon.style.display = 'flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.fontSize = '14px';
      icon.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.3)';
      
      // Create description
      const description = document.createElement('div');
      description.innerHTML = `<strong>${powerUp.name}:</strong> ${powerUp.description}`;
      description.style.flex = '1';
      
      // Add to entry
      entry.appendChild(icon);
      entry.appendChild(description);
      
      // Add to container
      this.powerUpKey.appendChild(entry);
    });
    
    // Add to body
    document.body.appendChild(this.powerUpKey);
  }
} 