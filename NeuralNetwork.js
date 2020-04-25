function getRandomNumber() {
  return Math.random()
}

function Matrix(drow, dcol) {
  this.data = new Array(drow).map(el => new Array(dcol).map(val => getRandomNumber()));
}

function Layer(size, outputSize, activation) {
  this.size = size;
  this.outputSize = outputSize;
  this.activation = activation;
  this.weights = new Matrix(outputSize, size)
}


function NeuralNetwork() {

}

export { Matrix, Layer, NeuralNetwork }