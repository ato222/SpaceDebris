var canvas = document.getElementById('myGame');
var ctx = canvas.getContext('2d');
var player = {
  width: 30,
  height: 30,
  x: 200,
  y: 515,
  speed: 5,
  color: "#4A92F8",
  status: 0,
};
var enemies = [];
var gameScene = 0;
var count = 0;
var timerId;
var onPlaying;
var time = 0;
var headerLabelX = 10, headerLabelY = 40;
var bullet = null;
var warpPlaces = [
  { x: canvas.width/4-player.width/2, y: canvas.height/4-player.height/2, width: player.width, height: player.height },
  { x: canvas.width/4*3-player.width/2, y: canvas.height/4-player.height/2, width: player.width, height: player.height },
  { x: canvas.width/4-player.width/2, y: canvas.height/4*3-player.height/2, width: player.width, height: player.height },
  { x: canvas.width/4*3-player.width/2, y: canvas.height/4*3-player.height/2, width: player.width, height: player.height },
  // center warp place
  { x: canvas.width/2-player.width/2, y: canvas.height/2-player.height/2, width: player.width, height: player.height },
];
var bullets = [];
var remainingShooting = 30;
var frameCount = 0;
var keyState = {
  right: false,
  left: false,
};
var reward = null;
var debrises = [];
var stars = [];
var starsCount = 1000;

// // audio elements
// var gameSounds = document.getElementById('game_sounds');
// var hittingSound = new Audio(gameSounds.children[0].src);
// var shootingSound = new Audio(gameSounds.children[1].src);
// var gameOverSound = new Audio(gameSounds.children[2].src);
// var highSpeedEnemyDeadSound = new Audio(gameSounds.children[3].src);
// var bulletsUpSound = new Audio(gameSounds.children[4].src);

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

// for pc or mobile
var event = ("ontouchstart" in window) ? "touchstart" : "click";
canvas.addEventListener(event, clickHandler, false);

canvas.addEventListener('touchstart', createBullet, false);
window.addEventListener('deviceorientation', handleOrientation, true);
// For Scroll Disable On Canvas
canvas.addEventListener('touchmove', function(event) {
  event.preventDefault();
});

start();
update();

function start() {
  createDebrises();
  createStars();
}

function update ()
{
  if (gameScene === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTitle();
    drawHowToPlay();
    drawBestTime();
    drawStartLabel();
    drawRollingDebris();
  }
  else if (gameScene === 1) {
    clearRectOnGame();
    drawBackground();
    drawWarpIndicators();
    drawTime();
    drawPlayer();
    drawEnemies();
    drawRemaingBulletsLabel();
    // for shoot
    if (onPlaying) {
      shootCollisionCheck(enemies);
      collisionCheck(enemies);
      movePlayer();
      moveEnemies();
      ensmallEnemies();
      if (bullets) {
        drawBullets();
        moveBullets();
        destroyBullet();
      }
    }
    else if (player.status === 1) {
      checkDisappearPlayer();
      ensmallObject(player, 0.3, 0.15);
    }
  }
  else if (gameScene === 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGameOverScene();
  }
  frameCount++;
  requestAnimationFrame(update);
}

function clearRectOnGame () {
  drawFillRect(0, 0, canvas.width, canvas.height, 'rgba(0, 0, 0, 0.2)');
}

function drawTitle ()
{
  drawText("SPACE DEBRIS", headerLabelX, headerLabelY, "30px Arial");
}

function drawHowToPlay() {
  drawText("Shooting: Screen Touch (SmartPhone) or Spacebar (PC)", headerLabelX, canvas.height-20, "15px Arial");
  drawText("Movement: Tilt The Device (SmartPhone) or ← → (PC)", headerLabelX, canvas.height-50, "15px Arial");
}

function drawBestTime()
{
  drawText("BEST SCORE: "+getBestTime(), headerLabelX, headerLabelY+30, '20px Arial', "white");
}

function drawStartLabel ()
{
  drawText("CLICK TO START", canvas.width/2-80, canvas.height/2, '20px Arial', "white")
}

function drawPlayer ()
{
  drawStrokeRect(player.x, player.y, player.width, player.height, player.color);
  drawStrokeRect(player.x+player.width/3, player.y-player.height/3, player.width/3, player.height/3, player.color);
}

function createEnemies ()
{
  var enemyCount = 15;
  for (var i = 0; i < enemyCount; i++) {
    var enemy = createEnemy();
    enemies.push(enemy);
  }
}

function moveEnemies ()
{
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].y += enemies[i].speed;
    if (enemies[i].y > canvas.height) {
      enemies[i].width = getRandomArbitrary(10, 70);
      enemies[i].height = getRandomArbitrary(10, 70);
      enemies[i].x = getRandomArbitrary(0, canvas.width);
      enemies[i].y = getRandomArbitrary(0, -100);
      enemies[i].speed = getRandomArbitrary(0.5, 3);
      enemies[i].color = 'white';
      enemies[i].reward = 0;
      enemies[i].highSpeed = false;

      createExtremeEnemy(enemies, i);
    }
  }
}

function createExtremeEnemy(enemies, i) {
    if ((i >= 0 && i <= 10) && getRandomTrueOrFalse()) {
      enemies[i].x = getRandomArbitrary(player.x-100-player.width, player.x+100+player.width);
      enemies[i].speed = getRandomArbitrary(5, 12);
      enemies[i].color = 'red';
      enemies[i].highSpeed = true;
    }
    if (i === 1 && getRandomTrueOrFalse()) {
      enemies[i].color = 'lime';
      enemies[i].reward = 1;
    }
}

function moveBullets () {
  for (var i = 0; i < bullets.length; i++) {
    bullets[i].y -= bullets[i].speed;
  }
}

function drawEnemies ()
{
  for (var i = 0; i < enemies.length; i++) {
    drawStrokeRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height, enemies[i].color)
  }
}

function drawBullets () {
  for (var i = 0; i < bullets.length; i++) {
    drawStrokeRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height, bullets[i].color);
  }
}

function destroyBullet() {
  for (var i = 0; i < bullets.length; i++) {
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
      break;
    }
  }
}

function keyDownHandler (e)
{
  if (e.keyCode === 37) {
    keyState.left = true;
  }
  if (e.keyCode === 39) {
    keyState.right = true;
  }
  shoot(e);
}

function keyUpHandler (e)
{
  if (e.keyCode === 37) {
    keyState.left = false;
  }
  if (e.keyCode === 39) {
    keyState.right = false;
  }
}

function movePlayer () {
  if (onPlaying && keyState.left === true && player.x > 0) {
    player.x -= player.speed;
  }
  if (onPlaying && keyState.right === true && player.x < canvas.width-player.width) {
    player.x += player.speed;
  }
}

function decideWarpTarget(obj) {
  var warpPlace = warpPlaces[getRandomArbitraryInt(0, warpPlaces.length-1)];
  obj.x = warpPlace.x;
  obj.y = warpPlace.y;
}

function warpCollisionCheck () {
  var playerCenterX = player.x + player.width/2;
  var playerCenterY = player.y + player.height/2;
  var warpPlaceCenterX = warpPlaces[warpPlaces.length-1].x + warpPlaces[warpPlaces.length-1].width;
  var warpPlaceCenterY = warpPlaces[warpPlaces.length-1].y + warpPlaces[warpPlaces.length-1].height/2;

  if ((Math.abs(warpPlaceCenterX - playerCenterX) < player.width/2 + warpPlaces[warpPlaces.length-1].width/2) &&
        (Math.abs(warpPlaceCenterY - playerCenterY) < player.height/2 + warpPlaces[warpPlaces.length-1].height/2)) {
          return true;
  }
}

function collisionCheck ()
{
  var playerCenterX = player.x + player.width/2;
  var playerCenterY = player.y + player.height/2;
  // For Hodai Collision
  var playerHodaiCenterX = player.x + player.width/3+player.width/3/2;
  var playerHodaiCenterY = player.y - player.height/3+player.height/3/2;

  for (var i = 0; i < enemies.length; i++) {
    var enemyCenterX = enemies[i].x + enemies[i].width/2;
    var enemyCenterY = enemies[i].y + enemies[i].height/2;
    if (((Math.abs(enemyCenterX - playerCenterX) < player.width/2 + enemies[i].width/2) &&
          (Math.abs(enemyCenterY - playerCenterY) < player.height/2 + enemies[i].height/2)) ||
            ((Math.abs(enemyCenterX - playerHodaiCenterX) < player.width/3/2 + enemies[i].width/2) &&
              (Math.abs(enemyCenterY - playerHodaiCenterY) < player.height/3/2 + enemies[i].height/2)) &&
                enemies[i].status === 0) {
                  drawFillRect(0, 0, canvas.width, canvas.height, "red");
                  gameOver();
    }
  }
}

function gameOver() {
  // gameOverSound.play();
  player.status = 1;
  stopGameAndSaveData();
  gameOverColorTransition();
}

function playerCollisionCheck() {
  return ;
}

function clickHandler(e) {
  if (gameScene === 1) return;
  if (gameScene === 0) {
    frameCount = 0;
    setTimerForIncrementtime();
    setTimeout(function() {
      createEnemies();
    }, 1500);
    onPlaying = true;
    gameScene++;
  }
  else if (gameScene === 2) {
    location.reload();
  }
}

function setTimerForIncrementtime ()
{
  timerId = setTimeout(function () {
    time++;
    setTimerForIncrementtime();
  }, 1000);
}

function drawGameOverScene () {
  drawGameOverLabel();
  drawRestartLabel();
  drawResult();
}

function drawGameOverLabel ()
{
  drawText("GAME OVER", headerLabelX, headerLabelY, "30px Arial", "red");
}

function drawResult ()
{
  drawText("TIME: "+time, headerLabelX, headerLabelY+30, '20px Arial', "white");
}

function drawRestartLabel ()
{
  drawText("CLICK TO RESTART", canvas.width/2-95, canvas.height/2, "20px Arial", "white");
}

function gameOverColorTransition () {
  player.color = 'red';
  for (var i = 0; i < enemies.length; i++) {
    enemies[i].color = 'red';
  }
}

function checkDisappearPlayer () {
  if (player.width < 0) {
    gameScene = 2;
  }
}

function ensmallObject(obj, sizeSpeed, positionSpeed) {
  obj.width -= sizeSpeed;
  obj.height -= sizeSpeed;
  obj.x += positionSpeed;
  obj.y += positionSpeed;
}

function ensmallEnemies() {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].status === 1) {
      ensmallObject(enemies[i], 1.5, 0.75);
      if (enemies[i].width <= 0 || enemies[i].height <= 0) {
          enemies.splice(i, 1);
      }
    }
  }
}

function drawTime ()
{
  drawText("TIME: "+time, headerLabelX, headerLabelY, '30px Arial', "red");
}

function drawWarpIndicators() {
  var loopCount = 0;
  // make only center warp place white
  warpPlaces.forEach(function(warpPlace) {
    color = (loopCount >= warpPlaces.length-1) ? "white" : "gray";
    drawFillRect(warpPlace.x, warpPlace.y, warpPlace.width, warpPlace.height, color);
    loopCount++;
  });
}

function shootCollisionCheck() {
  for (var i = 0; i < bullets.length; i++) {
    var bulletCenterX = bullets[i].x + bullets[i].width/2;
    var bulletCenterY = bullets[i].y + bullets[i].height/2;
    for (var j = 0; j < enemies.length; j++) {
      var enemyCenterX = enemies[j].x + enemies[j].width/2;
      var enemyCenterY = enemies[j].y + enemies[j].height/2;
        if (((Math.abs(enemyCenterX - bulletCenterX) < bullets[i].width/2 + enemies[j].width/2) &&
              (Math.abs(enemyCenterY - bulletCenterY) < bullets[i].height/2 + enemies[j].height/2)) &&
                  enemies[j].status === 0) {
          // hittingSound.play();
          drawFillRect(0, 0, canvas.width, canvas.height, "gray");
          enemies[j].status = 1;
          bullets.splice(i, 1);
          addEnemy();
          if (enemies[j].reward === 1) {
            // bulletsUpSound.play();
            drawFillRect(0, 0, canvas.width, canvas.height, "green");
            remainingShooting += 10;
          }
          if (enemies[j].highSpeed === true) {
            // highSpeedEnemyDeadSound.play();
            drawFillRect(0, 0, canvas.width, canvas.height, "red");
            killAllEnemies();
          }
          return;
        }
      }
      // bullet warp
      var centerWarpPlace = warpPlaces[warpPlaces.length-1];
      if (bullets[i].x > centerWarpPlace.x && bullets[i].x < centerWarpPlace.x+centerWarpPlace.width &&
            bullets[i].y > centerWarpPlace.y && bullets[i].y < centerWarpPlace.y+centerWarpPlace.height) {
              decideWarpTarget(bullets[i]);
      }
    }
}

function killAllEnemies() {
  for(var i = 0; i < enemies.length; i++) {
    enemies[i].status = 1;
  }
  setTimeout(function() {
    createEnemies();
  }, 2000);
}

function shoot(e) {
  if (gameScene !== 1) return;
  if (e.keyCode === 32) {
    createBullet();
  }
}

function createBullet() {
  if (remainingShooting <= 0) return;

  // shootingSound.play();

  var bullet = {
    width: player.width/3/3,
    height: player.width/3/3,
    speed: 10,
    color: "yellow",
    x: player.x+player.width/3+(player.width/3/3),
    y: player.y-player.height/3-10,
    highSpeed: false,
  };
  bullets.push(bullet);
  remainingShooting--;
}

function stopGameAndSaveData() {
  clearTimeout(timerId);
  onPlaying = false;
  saveTime();
}

function getBestTime() {
  if (localStorage.getItem('bestScore') === null) return "- - -";
  return localStorage.getItem('bestScore');
}

function saveTime() {
  if (time <= getBestTime()) return;
  localStorage.setItem("bestScore", time);
}

function drawBackground() {
  drawStars();
}

function addEnemy () {
  var enemy = createEnemy();
  enemies.push(enemy);
}

function createEnemy () {
  var enemy = {
    width: getRandomArbitrary(10, 150),
    height: getRandomArbitrary(10, 150),
    speed: getRandomArbitrary(0.5, 3),
    x: getRandomArbitrary(0, canvas.width),
    y: getRandomArbitrary(-100, -150),
    color: 'white',
    status: 0,
    reward: 0,
  };
  return enemy;
}

function drawRemaingBulletsLabel() {
  drawText('Bullets: '+remainingShooting, headerLabelX, canvas.height-15, "20px Arial", "white");
}

function createDebrises () {
  for (var i = 0; i < 300; i++) {
    var degree = getRandomArbitrary(0, 360);
    var speed = getRandomArbitrary(0.01, 0.3);
    var radius = getRandomArbitrary(100, 150);

    var debris = {
      x: null,
      y: null,
      r: 0.6,
      degree: degree,
      color: 'white',
      speed: speed,
      radius: radius,
    }
    debrises.push(debris);
  }
}

function drawRollingDebris () {
  for(var i = 0; i < debrises.length; i++) {
    var rollingRadius = debrises[i].radius;
    debrises[i].degree += debrises[i].speed;
    radian = debrises[i].degree * Math.PI/180;
    debrises[i].x = rollingRadius * Math.cos(radian) + canvas.width/2;
    debrises[i].y = rollingRadius * Math.sin(radian) + canvas.height/2;

    drawArc(debrises[i].x, debrises[i].y, debrises[i].r, debrises[i].color);
  }
}

function createStars () {
  for (var i = 0; i < starsCount; i++) {
    var star = {
      x: getRandomArbitrary(0, canvas.width),
      y: getRandomArbitrary(0, canvas.height),
      r: 0.2,
      color: 'white',
    }
    stars.push(star);
  }
}

function drawStars() {
  for (var i = 0; i < stars.length; i++) {
    drawArc(stars[i].x, stars[i].y, stars[i].r, stars[i].color);
  }
}

function handleOrientation(e) {
    var yAxis = e.gamma;
    moveCheckWithDeviceOrientation(Math.floor(yAxis));
}

function moveCheckWithDeviceOrientation(yOrientation) {
    if (yOrientation > 5) {
        // move right
        keyState.right = true;
        movePlayer();
    } else if (yOrientation < -5) {
        // move left
        keyState.left = true;
        movePlayer();
    } else {
        // no movement
        keyState.left = false;
        keyState.right = false;
    }
}
