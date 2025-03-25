import * as THREE from 'three';

export class Assets {
  static textures = {};
  static geometries = {};
  static materials = {};
  
  static loadTextures() {
    const textureLoader = new THREE.TextureLoader();
    
    // Background textures
    // Note: In a real game, you'd load actual image files
    // For this demo, we'll create procedural textures
    
    // Create a cityscape texture
    Assets.textures.cityscape = {
      day: Assets.createProceduralTexture('cityscape', false),
      night: Assets.createProceduralTexture('cityscape', true)
    };
    
    // Create a farmland texture
    Assets.textures.farmland = {
      day: Assets.createProceduralTexture('farmland', false),
      night: Assets.createProceduralTexture('farmland', true)
    };
    
    // Create an ocean texture
    Assets.textures.ocean = {
      day: Assets.createProceduralTexture('ocean', false),
      night: Assets.createProceduralTexture('ocean', true)
    };
    
    // Create a jungle texture
    Assets.textures.jungle = {
      day: Assets.createProceduralTexture('jungle', false),
      night: Assets.createProceduralTexture('jungle', true)
    };
  }
  
  static createProceduralTexture(type, isNight) {
    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Fill with background color
    if (isNight) {
      // Night sky
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000520');
      gradient.addColorStop(1, '#001040');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.7;
        const size = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add moon
      const moonX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const moonY = Math.random() * canvas.height * 0.3 + 30;
      const moonSize = 20 + Math.random() * 10;
      const moonGradient = ctx.createRadialGradient(
        moonX, moonY, 0,
        moonX, moonY, moonSize
      );
      moonGradient.addColorStop(0, '#fffce8');
      moonGradient.addColorStop(0.8, '#fffce8');
      moonGradient.addColorStop(1, 'rgba(255, 252, 232, 0)');
      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Day sky
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        const width = 30 + Math.random() * 70;
        const height = 10 + Math.random() * 20;
        ctx.beginPath();
        ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Add biome-specific elements
    switch (type) {
      case 'cityscape':
        this.drawCityscape(ctx, canvas.width, canvas.height, isNight);
        break;
      case 'farmland':
        this.drawFarmland(ctx, canvas.width, canvas.height, isNight);
        break;
      case 'ocean':
        this.drawOcean(ctx, canvas.width, canvas.height, isNight);
        break;
      case 'jungle':
        this.drawJungle(ctx, canvas.width, canvas.height, isNight);
        break;
    }
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    
    return texture;
  }
  
  static drawCityscape(ctx, width, height, isNight) {
    // Draw buildings
    const buildingCount = 15;
    const buildingWidth = width / buildingCount;
    
    for (let i = 0; i < buildingCount; i++) {
      const x = i * buildingWidth;
      const buildingHeight = Math.random() * (height * 0.6) + height * 0.2;
      const y = height - buildingHeight;
      
      // Building shape
      if (isNight) {
        // Dark buildings with lights
        ctx.fillStyle = '#111122';
        ctx.fillRect(x, y, buildingWidth, buildingHeight);
        
        // Windows
        ctx.fillStyle = '#FFCC55';
        const windowSize = buildingWidth / 8;
        const windowsHorizontal = Math.floor(buildingWidth / (windowSize * 1.5));
        const windowsVertical = Math.floor(buildingHeight / (windowSize * 1.5));
        
        for (let wx = 0; wx < windowsHorizontal; wx++) {
          for (let wy = 0; wy < windowsVertical; wy++) {
            // Some windows are lit, some are not
            if (Math.random() > 0.3) {
              ctx.fillRect(
                x + wx * windowSize * 1.5 + windowSize * 0.25,
                y + wy * windowSize * 1.5 + windowSize * 0.25,
                windowSize,
                windowSize
              );
            }
          }
        }
      } else {
        // Daytime buildings
        const color = Math.floor(Math.random() * 40) + 180;
        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        ctx.fillRect(x, y, buildingWidth, buildingHeight);
        
        // Windows
        ctx.fillStyle = '#87CEFA';
        const windowSize = buildingWidth / 8;
        const windowsHorizontal = Math.floor(buildingWidth / (windowSize * 1.5));
        const windowsVertical = Math.floor(buildingHeight / (windowSize * 1.5));
        
        for (let wx = 0; wx < windowsHorizontal; wx++) {
          for (let wy = 0; wy < windowsVertical; wy++) {
            ctx.fillRect(
              x + wx * windowSize * 1.5 + windowSize * 0.25,
              y + wy * windowSize * 1.5 + windowSize * 0.25,
              windowSize,
              windowSize
            );
          }
        }
      }
    }
  }
  
  static drawFarmland(ctx, width, height, isNight) {
    // Draw ground
    const groundY = height * 0.7;
    ctx.fillStyle = isNight ? '#113300' : '#55AA00';
    ctx.fillRect(0, groundY, width, height - groundY);
    
    // Draw hills
    ctx.fillStyle = isNight ? '#224400' : '#66BB00';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const hillWidth = 100 + Math.random() * 200;
      const hillHeight = 30 + Math.random() * 50;
      
      ctx.beginPath();
      ctx.ellipse(x, groundY, hillWidth, hillHeight, 0, 0, Math.PI, true);
      ctx.fill();
    }
    
    // Draw fields
    ctx.fillStyle = isNight ? '#332200' : '#DBB84D';
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const fieldWidth = 100 + Math.random() * 150;
      const fieldHeight = 10 + Math.random() * 30;
      
      ctx.fillRect(x - fieldWidth / 2, groundY - fieldHeight / 2, fieldWidth, fieldHeight);
    }
    
    // Draw barns
    for (let i = 0; i < 2; i++) {
      const x = Math.random() * width;
      const y = groundY - 20;
      const barnWidth = 40;
      const barnHeight = 30;
      
      // Barn body
      ctx.fillStyle = isNight ? '#550000' : '#CC0000';
      ctx.fillRect(x - barnWidth / 2, y - barnHeight / 2, barnWidth, barnHeight);
      
      // Barn roof
      ctx.beginPath();
      ctx.moveTo(x - barnWidth / 2, y - barnHeight / 2);
      ctx.lineTo(x, y - barnHeight / 2 - 15);
      ctx.lineTo(x + barnWidth / 2, y - barnHeight / 2);
      ctx.fill();
    }
    
    // Draw windmills
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = groundY - 30;
      const towerHeight = 50;
      
      // Tower
      ctx.fillStyle = isNight ? '#AAAAAA' : '#FFFFFF';
      ctx.fillRect(x - 3, y - towerHeight, 6, towerHeight);
      
      // Blades
      ctx.strokeStyle = isNight ? '#AAAAAA' : '#FFFFFF';
      ctx.lineWidth = 3;
      
      for (let j = 0; j < 4; j++) {
        const angle = j * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(x, y - towerHeight);
        ctx.lineTo(
          x + Math.cos(angle) * 25,
          (y - towerHeight) + Math.sin(angle) * 25
        );
        ctx.stroke();
      }
    }
  }
  
  static drawOcean(ctx, width, height, isNight) {
    // Draw ocean
    const waterY = height * 0.6;
    const gradient = ctx.createLinearGradient(0, waterY, 0, height);
    
    if (isNight) {
      gradient.addColorStop(0, '#001030');
      gradient.addColorStop(1, '#000520');
    } else {
      gradient.addColorStop(0, '#0077BE');
      gradient.addColorStop(1, '#005A92');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, waterY, width, height - waterY);
    
    // Draw waves
    ctx.strokeStyle = isNight ? '#0066AA' : '#55AAFF';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 10; i++) {
      const y = waterY + Math.random() * 40;
      const waveWidth = 50 + Math.random() * 100;
      
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x / waveWidth) * 5);
      }
      ctx.stroke();
    }
    
    // Draw distant islands
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const islandWidth = 30 + Math.random() * 60;
      const islandHeight = 10 + Math.random() * 20;
      
      ctx.fillStyle = isNight ? '#005500' : '#00AA00';
      ctx.beginPath();
      ctx.ellipse(x, waterY, islandWidth, islandHeight, 0, 0, Math.PI, true);
      ctx.fill();
    }
    
    // Draw boats
    for (let i = 0; i < 2; i++) {
      const x = Math.random() * width;
      const y = waterY + 10;
      const boatWidth = 30;
      const boatHeight = 10;
      
      // Boat hull
      ctx.fillStyle = isNight ? '#555555' : '#AA5500';
      ctx.beginPath();
      ctx.ellipse(x, y, boatWidth, boatHeight, 0, 0, Math.PI);
      ctx.fill();
      
      // Boat sail
      ctx.fillStyle = isNight ? '#999999' : '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(x, y - boatHeight);
      ctx.lineTo(x, y - boatHeight - 30);
      ctx.lineTo(x + 15, y - boatHeight - 15);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  static drawJungle(ctx, width, height, isNight) {
    // Draw ground
    const groundY = height * 0.75;
    ctx.fillStyle = isNight ? '#003300' : '#005500';
    ctx.fillRect(0, groundY, width, height - groundY);
    
    // Draw trees
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const treeHeight = 50 + Math.random() * 100;
      const y = groundY - treeHeight;
      
      // Tree trunk
      ctx.fillStyle = isNight ? '#331100' : '#663300';
      ctx.fillRect(x - 5, y + treeHeight * 0.3, 10, treeHeight * 0.7);
      
      // Tree foliage
      ctx.fillStyle = isNight ? '#003300' : '#008800';
      ctx.beginPath();
      ctx.ellipse(
        x, 
        y + treeHeight * 0.3, 
        20 + Math.random() * 10, 
        30 + Math.random() * 20, 
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    // Draw fog/mist (jungle atmosphere)
    ctx.fillStyle = isNight ? 
      'rgba(100, 150, 255, 0.05)' : 
      'rgba(255, 255, 255, 0.15)';
      
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * width;
      const y = groundY - 40 - Math.random() * 60;
      const mistWidth = 100 + Math.random() * 150;
      const mistHeight = 20 + Math.random() * 40;
      
      ctx.beginPath();
      ctx.ellipse(x, y, mistWidth, mistHeight, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add fireflies at night
    if (isNight) {
      ctx.fillStyle = 'rgba(255, 255, 150, 0.8)';
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = groundY - Math.random() * 100;
        const size = 1 + Math.random();
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
} 