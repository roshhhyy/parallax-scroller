# Parallax Scroller

A 2D side-scrolling arcade game with parallax backgrounds, multiple weapons, and enemies.

## Features

- Smooth parallax scrolling backgrounds that change based on biome
- Day/night cycle with visual effects
- Multiple weapon systems (Pistol, Shotgun, Laser)
- Ammo and charge management
- Jetpack flight mechanics with directional flame effects
- Enemy variety (triangle, square, circle, pentagon) with different behaviors
- Power-up system (health, fuel, ammo, charge)
- Damage number visualization for instant feedback
- Muzzle flash effects
- Weapon pickups and upgrades

## Controls

- **WASD** - Move character (W activates main jetpack thrust, A/D for horizontal movement)
- **Spacebar** - Fire weapon
- **1/2/3** - Switch between weapons (Pistol, Shotgun, Laser)

## Weapons

- **Pistol**: Infinite ammo, moderate damage, rapid fire
- **Shotgun**: Limited ammo, multiple pellets in a spread pattern, high damage
- **Laser**: Limited charge, continuous beam, high damage over time

## Power-ups

- Health (restores player health)
- Fuel (refills jetpack fuel)
- Shotgun ammo (replenishes shotgun shells)
- Laser charge (recharges laser weapon)
- Jetpack upgrade (improves jetpack performance)

## Technical Details

Built with:
- Three.js for rendering
- Pure JavaScript for game logic
- HTML/CSS for UI elements

## Running the Game

1. Clone the repository
2. Open `index.html` in a browser or set up a local server

```bash
# Using Python to create a simple HTTP server
python -m http.server 8000
```

3. Navigate to `http://localhost:8000` in your browser 