
// -- ALGORITHM
exports.getRandomNumber = function getRandomNumber() {
  return Math.random() * 60 - 30
}



exports.getNumberIn = function getNumberIn(s, e) {
  let pr = Math.random();
  return s + (e - s) * pr;
}