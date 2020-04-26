
// -- ALGORITHM
function getRandomNumber() {
  return Math.random() * 60 - 30
}

function getNumberIn(s, e) {
  let pr = Math.random();
  return s + (e - s) * pr;
}


function Matrix(drow, dcol) {
  this.n_rows = drow;
  this.n_cols = dcol;
  this.data = new Array(drow);
  this.data.fill(1, 0, drow)
  this.data = this.data.map( el => new Array(dcol) )
  this.data = this.data.map(array => array.fill(1, 0, dcol).map(val => getNumberIn(-2, 2)))

  this.copyColumn = (matrix, columnIdx) => {
    if (this.n_rows === matrix.n_rows && columnIdx < matrix.n_cols) {
      for (let i = 0; i < matrix.n_rows; i++) {
        this.data[i][columnIdx] = matrix.data[i][columnIdx]
      }
    } else {
      throw new Error('Matrix should have n_rows for copying a column')
    }
  }

}

function matrixElementWiseMultiplication(matrix, k) {
  let ans = new Matrix(matrix.n_rows, matrix.n_cols);
  for (i = 0; i < matrix.n_rows; i++) {
    for (j = 0; j < matrix.n_cols; j++) {
      ans.data[i][j] = k * matrix.data[i][j]
    }
  }
  return ans;
}



function matrixMultiplication(A, B) {
  const matA = A.data, matB = B.data;
  if (A.n_cols !== B.n_rows) {
    throw new Error('Matrix dimensions dont match for multiplication.');
  }
  let matAns = new Matrix(A.n_rows, B.n_cols)
  for (let i = 0; i < A.n_rows; i++) {
    for (let j = 0; j < B.n_cols; j++) {
      let accumulator = 0;
      for (let k = 0; k < A.n_cols; k++) {
        accumulator += matA[i][k] * matB[k][j]
      }
      matAns.data[i][j] = accumulator;
    }
  }
  return matAns;
}

function addMatrix(A, B) {
  if (A.n_rows !== B.n_rows || A.n_cols !== B.n_cols) {
    throw new Error('Matrix dimentions dont match for addition');
  }
  const matA = A.data, matB = B.data;
  const matAns = new Matrix(A.n_rows, A.n_cols);
  for (let i = 0; i < A.n_rows; i++) {
    for (let j = 0; j < A.n_cols; j++) {
      matAns.data[i][j] = matA[i][j] + matB[i][j];
    }
  }
  return matAns;
}

function Layer(size, outputSize, activation) {
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

function relu(vector) {
  let mat = new Matrix(vector.n_rows, vector.n_cols);
  for (let i = 0; i < vector.n_rows; i++) {
    for (let j = 0; j < vector.n_cols; j++) {
      mat.data[i][j] = Math.max(0, vector.data[i][j]);
    }
  }
  return mat
}

function sigmoid(vector) {
  let mat = new Matrix(vector.n_rows, vector.n_cols);
  for (let i = 0; i < vector.n_rows; i++) {
    for (let j = 0; j < vector.n_cols; j++) {
      mat.data[i][j] = 1 / (1 + Math.exp(-vector.data[i][j]) );
    }
  }
  return mat;
}

function NeuralNetwork(layers) {
  this.layers = layers

  this.feedFoward = function(inputVector) {
    return this.layers.reduce((prev, cur) => {
      return cur.compute(prev);
    }, inputVector)
  }
}


function Solution(NN) {
  this.representation = NN;
  this.fitScore = 0;

  this.setFitness = function(value) {
    this.fitScore = value;
  }

  // this.mate = function(solB) {
  //   let aNN = this.representation;
  //   let bNN = solB.representation;
  //   let nLayers = this.representation.layers.length;
  //   let newLayers = [];
  //   let sum = this.fitScore + solB.fitScore
  //   for (let i = 0; i < nLayers; i++) {
  //     let pr = getRandomNumber();
  //     let layer = new Layer(aNN.size, aNN.outputSize, aNN.activation);

  //     if (pr < 0.9) {
  //       layer.weights = addMatrix(matrixElementWiseMultiplication(aNN.layers[i].weights, this.fitScore/sum), matrixElementWiseMultiplication(bNN.layers[i].weights, solB.fitScore/sum))
  //       layer.bias = addMatrix(matrixElementWiseMultiplication(aNN.layers[i].bias, 0.8), matrixElementWiseMultiplication(bNN.layers[i].bias, 0.2))
  //     } else  {
  //       layer.weights = addMatrix(matrixElementWiseMultiplication(aNN.layers[i].weights, 0.5), matrixElementWiseMultiplication(bNN.layers[i].weights, 0.5))
  //       layer.bias = addMatrix(matrixElementWiseMultiplication(aNN.layers[i].bias, 0.5), matrixElementWiseMultiplication(bNN.layers[i].bias, 0.5))
  //     }
  //     newLayers.push(layer);
  //   }
  //   return new Solution(newLayers);
  // }
  this.mate = function(solB) {
    let aNN = this.representation;
    let bNN = solB.representation;
    let nLayers = this.representation.layers.length;
    let sum = this.fitScore + solB.fitScore
    let newLayers = [];
    for (let i = 0; i < nLayers; i++) {
        const layerA = aNN.layers[i];
        const layerB = bNN.layers[i];
        const layer = new Layer(layerA.size, layerA.outputSize, layerA.activation);
        let biasA = 0, biasB = 0;
        for (let j = 0; j < layerA.size; j++) {
          let pr = getRandomNumber();
          if (pr < 0.45) {
            layer.weights.copyColumn(layerA.weights, j)
            biasA += 1
          } else if (pr < 0.9) {
            layer.weights.copyColumn(layerB.weights, j)
            biasB += 1
          } else { 
            let m = layer.weights.data;
            let w1 = 0.25, w2 = 0.25;
            for (let k = 0; k < m.length; k++) {
              m[k][j] = layerA.weights.data[k][j] * w1 + layerB.weights.data[k][j] * w2 + (1 - w1 - w2) * getNumberIn(-50, 50);
            }
          }
        }
        layer.bias = addMatrix(matrixElementWiseMultiplication(layerA.bias, biasA/(biasA+biasB)),matrixElementWiseMultiplication( layerB.bias, biasB/(biasA+biasB)))
        newLayers.push(layer);
    }
    return new Solution(new NeuralNetwork(newLayers));
  }
}

class GeneticAlgorithm {
  constructor(populationSize, population, ellitism, target) {
    this.populationSize = populationSize;
    this.population = population;
    this.ellitism = ellitism;
    this.target = target;
  }
  runIteration = (fitScores, generation = 0) => {
    this.population.forEach((p, i) => p.setFitness(fitScores[i]));
    this.population = this.population.sort((a, b) => {
      if (a.fitScore < b.fitScore) return -1
      else if (a.fitScore > b.fitScore) return 1;
      else return 1;
    })
    console.log("Best solution is : ", this.population[this.populationSize-1]);    
    if (this.population[this.populationSize-1].fitScore > this.target) {
      console.log("Best solution is : ", this.population[this.populationSize-1]);
      return;
    }

    // Ellitism
    let newPopulation = [];
    for (let i = this.populationSize-1; newPopulation.length <= this.ellitism * this.populationSize; i--) {
      newPopulation.push(this.population[i]);
    }
    // Selection and Mutation
    for (let i = newPopulation.length; i <  this.populationSize; i = newPopulation.length) {
      
      let randomIdx1 = Math.floor(getNumberIn(this.populationSize * 0.5, this.populationSize)); // random index from last 50% of elements in array of population
      let randomIdx2 = Math.floor(getNumberIn(this.populationSize * 0.5, this.populationSize)); // random index from last 50% of elements in array of population
      let child = this.population[this.populationSize-1].mate(this.population[randomIdx2]);
      newPopulation.push(child)
    }
    this.population = newPopulation;
  }
}


// -- GAME --
const canvasElement = document.getElementById('canvas');
const ctx = canvasElement.getContext('2d')

const width = 900;
const height = 450;
const birdRadius = 20;
const canWidth = 55;
const canGap = 150;

ctx.fillStyle = 'green';
ctx.fillRect(0, 0, 30, 30)

// draw a circle!

function drawCircle(x, y, r) {
  ctx.moveTo(x + r, y);
  ctx.arc(x, y, r, 0, 2*Math.PI);
}

function getRandomGapHeight(canGap, height, offset=100) {
  return offset + getNumberIn(0.1, 0.5) * height;
}

function collided(birds, cans) {
  return birds.map(bird => {
    if (bird.dead) return true
    if (bird.y - birdRadius <= 0) return true
    if (bird.y + birdRadius >= height) return true
  
    const can = cans[0];
  
    if (bird.x + birdRadius >= can.x && (bird.x - birdRadius) <= can.x + canWidth ) { // if inside a can
      if (bird.y - birdRadius <= can.center - canGap*0.5 || bird.y + birdRadius >= can.center + 0.5 * canGap) // if birdY 
        return true;
      else return false;
    }
    return false;
  })
}

let N = 60;
let fitness = new Array(N).fill(0, 0, N);
let g = 0; // generation
function start(GA) {
  const populationSize = GA.populationSize

  let birds = new Array(populationSize).fill({ x: 100, y: height/2, vy: 0 }, 0, populationSize)
  birds = birds.map((b,i) => ({...b, y: b.y - i}))

  let cans = [
    {
      x: 900,
      center: getRandomGapHeight(canGap, height)
    },
    {
      x: 1350,
      center: getRandomGapHeight(canGap, height)
    }
  ]
  const gravity = 0.1;
  const vx = -1.0;
  let t = 0;
  let over = false;
  const interval = setInterval(() => {
    // calculate if colisions
    let collisions = collided(birds, cans);
    fitness = fitness.map((f, i) => {
      if (f === 0 && collisions[i]) {
        birds[i].dead = true;
        return t;
      }
      return f;
    })

    if (fitness.reduce((prev, val) => prev && val, 1)) {
      clearInterval(interval);
      over = true;
      console.log('Geneation #' + g, fitness);
      GA.runIteration(fitness, g++);
      fitness.fill(0, 0, N);
      start(GA)
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // calculate objects positions
    // bird
    let cmds = []
    birds.forEach((bird, i) => {
      if (bird.dead) {
        bird.x += vx
        return;
      }
      bird.vy += gravity
      bird.y += bird.vy;
      let xCan = cans[0].x - bird.x
      let inputVector = new Matrix(4, 1);
      inputVector.data = [[Math.max(0, xCan)], [bird.y], [bird.vy * 0.05], [cans[0].center - bird.y]];
      let command = GA.population[i].representation.feedFoward(inputVector);
      cmds.push(command.data[0][0])
      command = command.data[0][0];
      if (command < 0.5) {
        bird.vy = -4;
      }
    })
    // cans
    cans = cans.map(c => ({x: c.x += vx, center: c.center}));
    if (cans[0].x + canWidth <= 0) {
      cans.splice(0, 1);
      cans.push({
        x: 900 + 0.5 * canWidth,
        center: getRandomGapHeight(canGap, height)
      })
      t += 2000;
    }

    cans.forEach(c => {    
      ctx.fillStyle = 'green';
      ctx.fillRect(c.x, 0, canWidth, c.center - canGap*0.5)
      ctx.fillRect(c.x, c.center + canGap*0.5, canWidth, height - c.center);
    })

    // draw objects
    ctx.beginPath();

    birds.forEach(bird => {
      drawCircle(bird.x, bird.y, 20)
    })
    ctx.closePath();

    ctx.fillStyle = 'rgba(193, 35, 35, 0.5)'
    ctx.strokeStyle = '#003300'
    ctx.fill();
    ctx.stroke();
    // drawCircle(birdPos.x, birdPos.y, 2)
    t++;
  }, 10)

}
let population = new Array(N).fill(1, 0, N).map( _ => new Solution(new NeuralNetwork([new Layer(4, 5, sigmoid), new Layer(5, 12, relu),  new Layer(12, 1, sigmoid)])))
const GA = new GeneticAlgorithm(N, population, 0.2, 300000);

// start(GA);

start(GA);

// let m0 = new Matrix(4, 1);
// let m1 = new Matrix(6, 4);
// let m2 = new Matrix(1, 6);
// console.log(matrixMultiplication(m1, m0))
// console.log(matrixMultiplication(m2, matrixMultiplication(m1, m0)))


