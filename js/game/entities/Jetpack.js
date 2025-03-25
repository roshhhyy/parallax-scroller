export class Jetpack {
  constructor(level = 0) {
    this.level = level;
    this.upgrade(level);
  }
  
  upgrade(level) {
    this.level = level;
    
    // Set jetpack stats based on level
    switch(level) {
      case 0: // Base model
        this.maxFuel = 100;
        this.fuel = 100;
        this.fuelConsumptionRate = 30; // per second
        this.fuelRegenerationRate = 15; // per second
        this.speedMultiplier = 0;
        this.screenShakeAmount = 0;
        break;
      case 1: // Mid-tier
        this.maxFuel = 200;
        this.fuel = 200;
        this.fuelConsumptionRate = 25;
        this.fuelRegenerationRate = 20;
        this.speedMultiplier = 0.3;
        this.screenShakeAmount = 0.1;
        break;
      case 2: // Max upgrade
        this.maxFuel = Infinity;
        this.fuel = Infinity;
        this.fuelConsumptionRate = 0;
        this.fuelRegenerationRate = 0;
        this.speedMultiplier = 0.6;
        this.screenShakeAmount = 0.3;
        break;
    }
  }
  
  reset() {
    // Reset to base model
    this.upgrade(0);
  }
} 