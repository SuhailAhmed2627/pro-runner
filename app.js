screen.orientation.addEventListener("change", function () {
   if (screen.orientation.type == "landscape-primary" || screen.orientation.type == "landscape-secondary") {
      document.body.style.transform = `rotate(${screen.orientation.type == "landscape-primary" ? -90 : 90})`;
   }
});

const handleEvent = (event) => {
   if ((event.code === "Space" || event === "touchstart") && !GAME.isGameOver) {
      if (player.pushedUp) {
         requestAnimationFrame(function () {
            push("down");
         });
      } else {
         requestAnimationFrame(function () {
            push("up");
         });
      }
   }
};

//DOM Variables
const titleDOM = document.getElementById("title");
const detailsDOM = document.getElementById("details");
const playBtnDOM = document.getElementById("play-btn");
const inputNameDOM = document.getElementById("input-name");
const canvasDOM = document.getElementById("game");
const gameOverlayDOM = document.getElementById("game-overlay");
const gameOverlayTextDOM = document.getElementById("game-overlay-text");
const scoreDOM = document.getElementById("score");
const outerContainerDOM = document.getElementById("outer-container");
const viewScoresMenuDOM = document.getElementById("view-scores-menu");
const highScoresDOM = document.getElementById("high-scores");
const highScoresListDOM = document.getElementById("high-scores-list");

//Load Image for PowerUp Icon ⚡
const powerUpIcon = new Image();
powerUpIcon.src = "Media/flash.png";

function play() {
   titleDOM.style.display = "none";
   detailsDOM.style.display = "none";
   inputNameDOM.style.display = "none";
   playBtnDOM.style.display = "none";
   outerContainerDOM.style.display = "flex";
   canvasDOM.style.display = "inline";
   gameOverlayDOM.style.display = "flex";
   scoreDOM.style.display = "inline";

   // Load the gamescript
   let gameScript = document.createElement("script");
   gameScript.setAttribute("src", "./game.js");
   document.body.appendChild(gameScript);

   // Start after 5000ms
   setTimeout(function () {
      startGame();
      document.addEventListener("keypress", handleEvent);
      document.addEventListener("touchstart", handleEvent);
   }, 5000);
}

// Renders the Player, Starts rendering the Game
function startGame() {
   player.name = document.getElementById("name").value;
   gameOverlayDOM.style.display = "none";

   // Draw gap
   context.fillStyle = grey;
   context.fillRect(0, 125, spaceWidth, spaceHeight);

   // Draw Player
   contextObject.beginPath();
   contextObject.moveTo(player.xCord, player.yCord);
   contextObject.lineTo(player.xCord + player.side, player.yCord);
   contextObject.lineTo(player.xCord + player.side / 2, player.yCord - player.height);
   contextObject.closePath();
   contextObject.fillStyle = blue;
   contextObject.fill();

   // Render Holes
   window.requestAnimationFrame(renderHoles);
}

// eslint-disable-next-line no-unused-vars

function showGameOver() {
   gameOverMusic.play();
   gameOverlayDOM.style.display = "flex";
   scoreDOM.innerHTML = "";
   gameOverlayTextDOM.textContent = `Game Over! Score: ${Math.floor(GAME.score / 10)}`;
   viewScoresMenuDOM.style.display = "flex";

   checkHighScore(Math.floor(GAME.score / 10));
}

function updateScore() {
   scoreDOM.textContent = `Score: ${Math.floor(GAME.score / 10)}`;
}

// Check if score is Highscore
function checkHighScore(score) {
   var highScores = [];
   var lowestScore;
   if (!JSON.parse(localStorage.getItem("HIGH_SCORES") === null)) {
      highScores = JSON.parse(localStorage.getItem("HIGH_SCORES"));
   }
   if (highScores == null) {
      lowestScore = 0;
   } else {
      lowestScore = highScores[9] ? highScores[9].playerScore : 0;
   }

   if (score > lowestScore) {
      saveHighScore(highScores, score);
   }
}

// Save score if it is among the Top 10 highscores
function saveHighScore(highScores, score) {
   newEntry = {
      playerScore: score,
      playerName: player.name == "" ? "Unknown" : player.name,
   };
   if (highScores == null) {
      highScores = [newEntry];
   } else {
      highScores.push(newEntry);
   }
   highScores.sort((a, b) => b.playerScore - a.playerScore);

   highScores.splice(10);

   localStorage.setItem("HIGH_SCORES", JSON.stringify(highScores));
}

// View Highscore
function viewHighScores() {
   viewScoresMenuDOM.style.display = "none";
   gameOverlayDOM.style.display = "none";
   outerContainerDOM.style.display = "none";
   highScoresDOM.style.display = "flex";

   var highScores = JSON.parse(localStorage.getItem("HIGH_SCORES")) ?? [];

   highScoresListDOM.innerHTML = highScores.map((entry) => `<li>${entry.playerScore} - ${entry.playerName}`).join("");
}
