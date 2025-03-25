import * as THREE from 'three';

export class DayNightCycle {
  constructor(game) {
    this.game = game;
    
    // Day-night state
    this.isNight = false;
    this.transitionProgress = 0;
    this.transitionSpeed = 0.3; // Speed of day-night transition
    
    // Cycle duration (in seconds)
    this.cycleDuration = 120; // 2 minutes
    this.timeInCycle = 0;
    
    // Scene lighting
    this.initLighting();
  }
  
  initLighting() {
    // Ambient light (affects the whole scene)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.game.scene.add(this.ambientLight);
  }
  
  update(deltaTime) {
    // Update cycle time
    this.timeInCycle += deltaTime;
    
    // Check if we need to switch between day and night
    if (this.timeInCycle >= this.cycleDuration) {
      this.timeInCycle = 0;
      this.startTransition();
    }
    
    // Handle transition if in progress
    if (this.transitionProgress > 0 && this.transitionProgress < 1) {
      this.transitionProgress += deltaTime * this.transitionSpeed;
      
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 0;
        this.isNight = !this.isNight;
        
        // Update background for new time of day
        this.game.background.setBiome(this.game.currentBiome, this.isNight);
      }
      
      // Update lighting during transition
      this.updateLighting();
    }
  }
  
  startTransition() {
    // Start transition to opposite time of day
    this.transitionProgress = 0.01; // Just enough to start the transition
  }
  
  updateLighting() {
    // Adjust lighting based on day/night
    if (this.isNight) {
      // Transitioning to day
      const intensity = 0.6 + (1 - this.transitionProgress) * 0.4;
      this.ambientLight.intensity = intensity;
    } else {
      // Transitioning to night
      const intensity = 1 - this.transitionProgress * 0.4;
      this.ambientLight.intensity = intensity;
    }
  }
  
  transitionToTimeOfDay(night) {
    // Set the time of day directly for debugging purposes
    this.isNight = night;
    
    // Update lighting immediately
    if (this.isNight) {
      this.ambientLight.intensity = 0.6; // Night intensity
    } else {
      this.ambientLight.intensity = 1; // Day intensity
    }
    
    // Reset cycle timer
    this.timeInCycle = 0;
    this.transitionProgress = 0;
  }
} 