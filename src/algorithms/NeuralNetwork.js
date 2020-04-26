import Matrix, { addMatrix, matrixMultiplication} from '../util/Matrix'

export function Layer(size, outputSize, activation) {
  this.size = size;
  this.outputSize = outputSize;
  this.activation = activation;
  this.weights = new Matrix(outputSize, size)
  this.bias = new Matrix(outputSize, 1);
  this.activation = activation;

  this.compute = function(inputVector) {
    let ans1 = matrixMultiplication(this.weights, inputVector);
    return this.activation(addMatrix(ans1, this.bias))
  }
}

export function relu(vector) {
  let mat = new Matrix(vector.n_rows, vector.n_cols);
  for (let i = 0; i < vector.n_rows; i++) {
    for (let j = 0; j < vector.n_cols; j++) {
      mat.data[i][j] = Math.max(0, vector.data[i][j]);
    }
  }
  return mat
}

export function sigmoid(vector) {
  let mat = new Matrix(vector.n_rows, vector.n_cols);
  for (let i = 0; i < vector.n_rows; i++) {
    for (let j = 0; j < vector.n_cols; j++) {
      mat.data[i][j] = 1 / (1 + Math.exp(-vector.data[i][j]) );
    }
  }
  return mat;
}

export default function NeuralNetwork(layers) {
  this.layers = layers

  this.feedFoward = function(inputVector) {
    return this.layers.reduce((prev, cur) => {
      return cur.compute(prev);
    }, inputVector)
  }
}
