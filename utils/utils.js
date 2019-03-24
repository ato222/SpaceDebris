function getRandomTrueOrFalse () {
  return getRandomArbitraryInt(0, 2);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomArbitraryInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomRGBColor() {
  var r = getRandomArbitraryInt(0, 255);
  var g = getRandomArbitraryInt(0, 255);
  var b = getRandomArbitraryInt(0, 255);
  return 'rgb('+r+','+g+','+b+')';
}