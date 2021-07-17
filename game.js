const cos60 = Math.cos(Math.PI / 6);
const spaceWidth = 800;
const spaceHeight = 200;

const gameOverMusic = new Audio("Media/gameOverMusic.mp3");

// Colours
const [grey, blue, red] = ["#363636", "#2588D4", "#EA3D51"];

// Canvas Variables
const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

// Canvas Variables for Object
const canvasObject = document.getElementById("object");
const contextObject = canvasObject.getContext("2d");

//* Controls the State of the Game and produces next element
class Game {
   constructor() {
      this.speedX = 2;
      this.speedY = 5;
      this.obstacleVX = 1;
      this.obstacleVY = 1;
      this.distance = 0;
      this.score = 0;
      this.isGameOver = false;
      this.level = 1;
      this.levelGap = 5000;
      this.isObjectRendering = false;
      this.isHoleRendering = false;
      this.plan = {
         powerUpProb: 10,
         obstacleProb: 30,
         holeProb: 100,
      };
   }

   updateGamePlay() {
      if (player.power.endPowerUp) {
         player.power.endPowerUp = false;
         endPowerUp();
      }
      if (this.distance > this.levelGap) {
         this.distance = 0;
         this.level++;

         if (this.level == 2) {
            this.obstacleVY += 1;
            this.obstacleVX += 1;
         }

         if (this.level <= 4) {
            this.plan = {
               powerUpProb: 20,
               obstacleProb: 40,
               holeProb: 100,
            };
            this.levelGap += 5000;
            this.speedX++;
         }
      }
      if (!GAME.isObjectRendering) {
         var step = Math.floor(Math.random() * 100) + 1;
         if (step < this.plan.powerUpProb) {
            createNewPowerUp();
         } else if (step < this.plan.obstacleProb) {
            createNewObstacle(this.obstacleVX, this.obstacleVY);
            window.requestAnimationFrame(renderHoles);
         } else if (!GAME.isHoleRendering) {
            window.requestAnimationFrame(renderHoles);
         }
      } else if (!GAME.isHoleRendering) {
         window.requestAnimationFrame(renderHoles);
      }
   }
}

//* Hole and its Properties
class Hole {
   constructor() {
      this.width = 200 - 10 * Math.floor(Math.random() * 5);
      this.xCord = 800;
      this.yCord = Math.round(Math.random()) == 1 ? 0 : 325;
   }
   reset() {
      this.yCord = Math.round(Math.random()) == 1 ? 0 : 325;
      this.xCord = 800;
      this.width = 200 - 10 * Math.floor(Math.random() * 5);
   }
}

//* Player and its Properties
class Player {
   constructor(side, xCord, yCord) {
      this.name = "";
      this.power = {
         poweredUp: false,
         invisibility: false,
         slowedDown: false,
         endPowerUp: false,
      };
      this.degrees = 180;
      this.pushedUp = false;
      this.transitioned = true;
      this.side = side;
      this.height = (side * Math.sqrt(3)) / 2;
      this.xCord = xCord;
      this.yCord = yCord;
      this.centerCord = { x: this.xCord + side / 2, y: this.yCord - this.height + (this.side / 2) * cos60 };
      this.radius = Math.hypot(this.side / 2, this.yCord - this.centerCord.y);
   }

   drawShape() {
      contextObject.translate(this.centerCord.x, this.centerCord.y);
      contextObject.rotate((Math.PI / 180) * this.degrees);
      contextObject.beginPath();
      contextObject.moveTo(-this.side / 2, -this.height + (this.side / 2) * cos60);
      contextObject.lineTo(this.side / 2, -this.height + (this.side / 2) * cos60);
      contextObject.lineTo(0, (this.side / 2) * cos60);
      contextObject.closePath();
      contextObject.fillStyle = blue;
      contextObject.fill();
      contextObject.rotate(-(Math.PI / 180) * this.degrees);
      contextObject.translate(-this.centerCord.x, -this.centerCord.y);
   }

   updateCenter() {
      this.centerCord.y = this.yCord - this.height + (this.side / 2) * cos60;
   }
}

//* Obstacle and its Properties
class Obstacle {
   constructor(shape, vx, vy) {
      this.shape = shape;
      this.vx = vx;
      this.vy = vy;
      this.cord = { x: this.shape === "box" ? 800 : 825, y: this.shape === "box" ? Math.floor(Math.random() * (265 - 135) + 135) : Math.floor(Math.random() * (290 - 160) + 160) };
      this.movingDown = true;
      this.dimension = this.shape == "circle" ? 25 : 50;
   }
}

//* Power Up and its Properties
class PowerUp {
   constructor(ability) {
      this.ability = ability;
      this.cord = { x: 800, y: 225 };
      this.dimension = 25;
      this.iconLoaded = false;
   }
}

// Variables of the elements of this Game
var GAME = new Game();
var player = new Player(50, 100, 325);
var hole = new Hole();

// Pushes or switches the Gravity
function push(direction) {
   player.transitioned = false;
   if ((direction === "up" && player.yCord > 170) || (direction !== "up" && player.yCord < 325)) {
      if (player.yCord >= 200 && player.yCord < 300) {
         player.degrees -= 9;
      }
      player.yCord += direction === "up" ? -GAME.speedY : GAME.speedY;
      if (player.yCord === 170) {
         player.yCord = 125 + player.height;
      }
      contextObject.clearRect(0, 0, canvasObject.width, canvasObject.height);
      player.updateCenter();
      player.drawShape();
      if (player.yCord === 125 + player.height) {
         player.yCord = 170;
      }
      requestAnimationFrame(function () {
         push(direction);
      });
   } else {
      player.degrees = direction === "up" ? 0 : 180;
      player.transitioned = true;
      player.pushedUp = direction === "up" ? true : false;
   }
}

// Using requestAnimationFrame render Holes
function renderHoles() {
   GAME.isHoleRendering = true;
   updateScore();
   GAME.distance++;
   GAME.score = GAME.score + 1 / 10;
   if (hole.xCord < 800) {
      context.clearRect(hole.xCord + GAME.speedX, hole.yCord, hole.width, 125);
   }

   context.fillStyle = grey;
   context.fillRect(hole.xCord, hole.yCord, hole.width, 125);

   hole.xCord = hole.xCord - GAME.speedX;

   if (touchedHole(hole.xCord, hole.xCord + hole.width) || GAME.isGameOver) {
      showGameOver();
   } else {
      if (hole.xCord >= -hole.width) {
         window.requestAnimationFrame(renderHoles);
      }
      if (hole.xCord === -hole.width - GAME.speedX || (GAME.speedX % 3 === 0 && hole.xCord < -hole.width)) {
         context.clearRect(hole.xCord + GAME.speedX, hole.yCord, hole.width, 125);
         hole.reset();
         GAME.isHoleRendering = false;
         GAME.updateGamePlay();
      }
   }
}

// Check if Hole touches the Player
function touchedHole(x, y) {
   if (hole.yCord == 0) {
      if (player.transitioned && player.pushedUp && player.xCord <= y && player.xCord >= x) {
         GAME.isGameOver = true;
         return true;
      }
   } else {
      if (player.transitioned && !player.pushedUp && player.xCord + player.side / 2 <= y && player.xCord <= y && player.xCord >= x) {
         GAME.isGameOver = true;
         return true;
      }
   }
   return false;
}

// Using requestAnimationFrame render Obstacles
function renderObstacle(obstacle) {
   GAME.isObjectRendering = true;
   context.beginPath();
   context.fillStyle = grey;
   if (obstacle.shape == "circle") {
      context.fillRect(
         obstacle.cord.x + (player.power.slowedDown ? 1 : obstacle.vx) - obstacle.dimension,
         obstacle.cord.y - obstacle.dimension + (obstacle.movingDown ? -(player.power.slowedDown == true ? 1 : obstacle.vy) : player.power.slowedDown == true ? 1 : obstacle.vy),
         50,
         50
      );
   } else {
      context.fillRect(
         obstacle.cord.x + (player.power.slowedDown ? 1 : obstacle.vx),
         obstacle.cord.y + (obstacle.movingDown ? -(player.power.slowedDown ? 1 : obstacle.vy) : player.power.slowedDown ? 1 : obstacle.vy),
         50 + 2 * (player.power.slowedDown ? 1 : obstacle.vx),
         50
      );
   }
   context.fill();
   context.closePath();

   context.beginPath();
   context.fillStyle = red;
   if (obstacle.shape == "circle") {
      context.arc(obstacle.cord.x, obstacle.cord.y, 25, (Math.PI / 180) * 0, (Math.PI / 180) * 360);
   } else {
      context.fillRect(obstacle.cord.x, obstacle.cord.y, obstacle.dimension, obstacle.dimension);
   }
   context.fill();
   context.closePath();

   if (obstacle.cord.y < (obstacle.shape == "circle" ? 290 : 265) && obstacle.movingDown === true) {
      obstacle.cord.y += player.power.slowedDown == true ? 1 : obstacle.vy;
   }

   if (obstacle.cord.y > (obstacle.shape == "circle" ? 160 : 135) && obstacle.movingDown === false) {
      obstacle.cord.y -= player.power.slowedDown == true ? 1 : obstacle.vy;
   }

   if (obstacle.cord.y >= (obstacle.shape == "circle" ? 290 : 265) || obstacle.cord.y <= (obstacle.shape == "circle" ? 160 : 135)) {
      obstacle.movingDown = !obstacle.movingDown;
   }
   obstacle.cord.x -= player.power.slowedDown == true ? 1 : obstacle.vx;
   if (!player.power.invisibility && touchedObstacle(obstacle)) {
      showGameOver();
   } else if (obstacle.cord.x >= -(obstacle.shape == "circle" ? 25 : 50) && !GAME.isGameOver) {
      window.requestAnimationFrame(function () {
         renderObstacle(obstacle);
      });
   } else {
      GAME.isObjectRendering = false;
      GAME.updateGamePlay();
   }
}

// Check if Obstacle touches the Player
function touchedObstacle(obstacle) {
   if (obstacle.shape === "circle") {
      if (Math.hypot(player.centerCord.x - obstacle.cord.x, player.centerCord.y - obstacle.cord.y) <= player.height - player.radius + obstacle.dimension) {
         GAME.isGameOver = true;
         return true;
      } else {
         return false;
      }
   } else {
      if (
         Math.hypot(player.centerCord.x - (obstacle.cord.x + obstacle.dimension / 2), player.centerCord.y - (obstacle.cord.y + obstacle.dimension / 2)) <=
         player.height - player.radius + obstacle.dimension / 1.414
      ) {
         GAME.isGameOver = true;
         return true;
      } else {
         return false;
      }
   }
}

// Using requestAnimationFrame render Power Up
function renderPowerUp(power) {
   updateScore();
   GAME.distance++;
   GAME.score = GAME.score + 1 / 10;
   context.fillStyle = grey;
   context.fillRect(power.cord.x + GAME.speedX, power.cord.y, 24, 24);
   if (!player.power.poweredUp) {
      context.drawImage(powerUpIcon, power.cord.x, power.cord.y, 24, 24);
   }
   if (touchedPowerUp(power) && !player.power.poweredUp) {
      initPowerUp(power.ability);
   }
   power.cord.x -= GAME.speedX;
   if (power.cord.x >= -25 && !GAME.isGameOver) {
      window.requestAnimationFrame(function () {
         renderPowerUp(power);
      });
   } else {
      GAME.updateGamePlay();
   }
}

// Initialise Power Up
function initPowerUp(ability) {
   player.power.poweredUp = true;
   if (ability == "invisibility") {
      player.power.invisibility = true;
      contextObject.globalAlpha = 0.5;
   } else if (ability == "slowDown") {
      player.power.slowedDown = true;
      GAME.speedX = 2;
   }
   setTimeout(function () {
      player.power.endPowerUp = true;
   }, 10000);
}

// End Power Up
function endPowerUp() {
   player.power.poweredUp = false;
   if (player.power.invisibility == true) {
      player.power.invisibility = false;
      contextObject.globalAlpha = 1;
   } else if (player.power.slowedDown == true) {
      player.power.slowedDown = false;
      GAME.speedX = 5;
   }
}

// Check if Power Up touches the Player
function touchedPowerUp(power) {
   if (Math.hypot(player.centerCord.x - power.cord.x, player.centerCord.y - power.cord.y) <= player.height - player.radius + power.dimension) {
      return true;
   } else {
      return false;
   }
}

// Create a New Obstacle
function createNewObstacle(vx, vy) {
   var obstacle = new Obstacle(Math.round(Math.random()) == 1 ? "circle" : "box", vx, vy);
   renderObstacle(obstacle);
}

// Create a New Power Up
function createNewPowerUp() {
   var power = new PowerUp(Math.round(Math.random()) == 1 ? "invisibility" : "slowDown");
   renderPowerUp(power);
}
