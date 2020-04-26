import { getNumberIn, getRandomNumber } from './random';

export default function Matrix(drow, dcol) {
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

export function matrixElementWiseMultiplication(matrix, k) {
  // console.log(matrix, '*' , k)
  let ans = new Matrix(matrix.n_rows, matrix.n_cols);
  for (let i = 0; i < matrix.n_rows; i++) {
    for (let j = 0; j < matrix.n_cols; j++) {
      ans.data[i][j] = k * matrix.data[i][j]
    }
  }
  return ans;
}



export function matrixMultiplication(A, B) {
  // console.log(A, B);
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

export function addMatrix(A, B) {
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

