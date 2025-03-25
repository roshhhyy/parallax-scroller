export class InputManager {
  constructor() {
    // Input state
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      fire: false,
      weapon1: false,
      weapon2: false,
      weapon3: false,
      interact: false
    };
    
    // Event listeners
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }
  
  handleKeyDown(event) {
    switch(event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keys.up = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keys.down = true;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keys.left = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keys.right = true;
        break;
      case ' ':
        this.keys.fire = true;
        break;
      case '1':
        this.keys.weapon1 = true;
        break;
      case '2':
        this.keys.weapon2 = true;
        break;
      case '3':
        this.keys.weapon3 = true;
        break;
      case 'e':
      case 'E':
        this.keys.interact = true;
        break;
    }
  }
  
  handleKeyUp(event) {
    switch(event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.keys.up = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.keys.down = false;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.keys.right = false;
        break;
      case ' ':
        this.keys.fire = false;
        break;
      case '1':
        this.keys.weapon1 = false;
        break;
      case '2':
        this.keys.weapon2 = false;
        break;
      case '3':
        this.keys.weapon3 = false;
        break;
      case 'e':
      case 'E':
        this.keys.interact = false;
        break;
    }
  }
  
  isMoving() {
    return this.keys.up || this.keys.down || this.keys.left || this.keys.right;
  }
} 