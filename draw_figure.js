function drawArc(x, y, r, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fill();
  ctx.closePath();
}

function drawFillRect(x, y, width, height, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.closePath();
}

function drawStrokeRect(x, y, width, height, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.rect(x, y, width, height);
  ctx.stroke();
  ctx.closePath();
}

function drawText(text, x, y, font, style) {
  ctx.beginPath();
  ctx.font = font;
  ctx.fillStyle = style;
  ctx.fillText(text, x, y);
  ctx.closePath();
}
