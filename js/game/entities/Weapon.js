import { WeaponModel } from './WeaponModel.js';

export class Weapon {
  constructor(type) {
    this.type = type;
    this.model = new WeaponModel(type);
    
    // Weapon stats
    switch(type) {
      case 0: // Pistol
        this.damage = 20;
        this.fireRate = 0.1;
        this.heat = 0;
        this.maxHeat = 0;
        this.overheated = false;
        this.ammo = Infinity; // Pistol has infinite ammo
        this.maxAmmo = Infinity;
        this.charge = Infinity; // Pistol has infinite charge
        this.maxCharge = Infinity;
        break;
      case 1: // Shotgun
        this.damage = 15;
        this.fireRate = 0.75;
        this.heat = 0;
        this.maxHeat = 0;
        this.overheated = false;
        this.ammo = 30; // Start with 30 shells
        this.maxAmmo = 30;
        this.charge = Infinity; // Shotgun has infinite charge
        this.maxCharge = Infinity;
        break;
      case 2: // Laser
        this.damage = 40;
        this.fireRate = 0.1;
        this.heat = 0;
        this.maxHeat = 100;
        this.overheated = false;
        this.ammo = Infinity; // Laser has infinite ammo
        this.maxAmmo = Infinity;
        this.charge = 100; // Start with 100 charge
        this.maxCharge = 100;
        break;
    }
  }

  reset() {
    this.heat = 0;
    this.overheated = false;
    switch(this.type) {
      case 0: // Pistol
        this.ammo = Infinity;
        this.charge = Infinity;
        break;
      case 1: // Shotgun
        this.ammo = 30;
        this.charge = Infinity;
        break;
      case 2: // Laser
        this.ammo = Infinity;
        this.charge = 100;
        break;
    }
  }

  useAmmo() {
    if (this.ammo > 0) {
      this.ammo--;
      return true;
    }
    return false;
  }

  useCharge(amount) {
    if (this.charge >= amount) {
      this.charge -= amount;
      return true;
    }
    return false;
  }

  addAmmo(amount) {
    this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
  }

  addCharge(amount) {
    this.charge = Math.min(this.maxCharge, this.charge + amount);
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
    }
  }
} 