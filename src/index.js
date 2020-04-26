import { getNumberIn, getRandomNumber } from './util/random';
import Matrix, { matrixElementWiseMultiplication, matrixMultiplication, addMatrix } from './util/Matrix';
import NeuralNetwork, { Layer, sigmoid, relu } from './algorithms/NeuralNetwork'
import GeneticAlgorithm, { Solution } from './algorithms/GeneticAlgorithm';
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


