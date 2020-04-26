import { addMatrix, matrixElementWiseMultiplication } from '../util/Matrix'
import { getNumberIn } from '../util/random';
import NeuralNetwork, { Layer } from '../algorithms/NeuralNetwork';

export function Solution(NN) {
  this.representation = NN;
  this.fitScore = 0;

  this.setFitness = (value) => {
    this.fitScore = value;
  }
  this.mate = (solB) => {
    let aNN = this.representation;
    let bNN = solB.representation;
    let nLayers = this.representation.layers.length;
    let newLayers = [];
    for (let i = 0; i < nLayers; i++) {
        const layerA = aNN.layers[i];
        const layerB = bNN.layers[i];
        let layer = new Layer(layerA.size, layerA.outputSize, layerA.activation);
        let biasA = 0, biasB = 0;
        for (let j = 0; j < layerA.size; j++) {
          let pr = Math.random();
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

export default class GeneticAlgorithm {
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

