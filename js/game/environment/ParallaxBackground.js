import * as THREE from 'three';
import { Assets } from '../Assets.js';

export class ParallaxBackground {
  constructor(game) {
    this.game = game;
    
    // Create container for all background layers
    this.container = new THREE.Group();
    
    // Create layers
    this.layers = {
      background: null, // Distant sky/horizon
      midground: null,  // Middle elements (trees, buildings)
      foreground: null  // Closest elements
    };
    
    // Scroll speeds (relative to camera movement)
    this.scrollSpeeds = {
      background: 0.2,
      midground: 0.5,
      foreground: 0.8
    };
    
    // Load textures
    this.loadTextures();
    
    // Initial biome
    this.currentBiome = 0;
    this.setBiome(0, false); // Start with cityscape, daytime
  }
  
  loadTextures() {
    // Load textures through asset manager
    Assets.loadTextures();
  }
  
  createLayers() {
    // Clear existing layers
    if (this.layers.background) this.container.remove(this.layers.background);
    if (this.layers.midground) this.container.remove(this.layers.midground);
    if (this.layers.foreground) this.container.remove(this.layers.foreground);
    
    // Create background layer (sky and distant elements)
    const backgroundGeometry = new THREE.PlaneGeometry(200, 100);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      map: this.currentTexture.background,
      transparent: true
    });
    this.layers.background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    this.layers.background.position.set(0, 0, -10);
    this.container.add(this.layers.background);
    
    // Create midground layer
    const midgroundGeometry = new THREE.PlaneGeometry(200, 100);
    const midgroundMaterial = new THREE.MeshBasicMaterial({
      map: this.currentTexture.midground,
      transparent: true
    });
    this.layers.midground = new THREE.Mesh(midgroundGeometry, midgroundMaterial);
    this.layers.midground.position.set(0, 0, -5);
    this.container.add(this.layers.midground);
    
    // Create foreground layer
    const foregroundGeometry = new THREE.PlaneGeometry(200, 100);
    const foregroundMaterial = new THREE.MeshBasicMaterial({
      map: this.currentTexture.foreground,
      transparent: true
    });
    this.layers.foreground = new THREE.Mesh(foregroundGeometry, foregroundMaterial);
    this.layers.foreground.position.set(0, 0, -2);
    this.container.add(this.layers.foreground);
  }
  
  setBiome(biomeIndex, isNight) {
    // Get biome textures
    let biomeTextures;
    
    switch(biomeIndex) {
      case 0: // Cityscape
        biomeTextures = isNight ? Assets.textures.cityscape.night : Assets.textures.cityscape.day;
        break;
      case 1: // Farmland
        biomeTextures = isNight ? Assets.textures.farmland.night : Assets.textures.farmland.day;
        break;
      case 2: // Ocean
        biomeTextures = isNight ? Assets.textures.ocean.night : Assets.textures.ocean.day;
        break;
      case 3: // Jungle
        biomeTextures = isNight ? Assets.textures.jungle.night : Assets.textures.jungle.day;
        break;
      default:
        biomeTextures = isNight ? Assets.textures.cityscape.night : Assets.textures.cityscape.day;
    }
    
    // For simplicity in this version, we'll use the same texture for all layers
    // In a more complex implementation, each layer would have its own texture
    this.currentTexture = {
      background: biomeTextures,
      midground: biomeTextures,
      foreground: biomeTextures
    };
    
    // Create or update layers
    this.createLayers();
  }
  
  update(deltaTime) {
    // Scroll each layer based on its scroll speed
    Object.keys(this.layers).forEach(layerName => {
      const layer = this.layers[layerName];
      if (!layer) return;
      
      // Get layer's texture offset
      const offset = layer.material.map.offset;
      
      // Update offset based on scroll speed
      // This creates the parallax effect (different speeds for different layers)
      offset.x += this.scrollSpeeds[layerName] * deltaTime * 0.1;
      
      // Reset when we've scrolled a full texture width to create endless scrolling
      if (offset.x > 1) {
        offset.x = 0;
      }
      
      // Apply the offset
      layer.material.map.offset.set(offset.x, 0);
    });
  }
  
  resize(width, height) {
    // Adjust background to maintain aspect ratio
    const aspect = width / height;
    
    Object.values(this.layers).forEach(layer => {
      if (layer) {
        // Scale the layer to fill the screen
        const scale = Math.max(1, aspect);
        layer.scale.set(scale, 1, 1);
      }
    });
  }
} 