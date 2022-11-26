import { Tuple } from './tuples';

export function identityMatrix(): number[][] {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

export function areEqual(m1: number[][], m2: number[][]): boolean {
  const equal = function (a: number, b: number): boolean {
    return Math.abs(a - b) < 0.00001;
  };

  if (m1.length !== m2.length) {
    return false;
  }
  for (let r = 0; r < m1.length; r++) {
    if (m1[r].length !== m2[r].length) {
      return false;
    }

    for (let c = 0; c < m1[r].length; c++) {
      if (equal(m1[r][c], m2[r][c]) === false) {
        return false;
      }
    }
  }
  return true;
}

export function multiplyMatrices(a: number[][], b: number[][]): number[][] {
  const x = a.length;
  const y = b[0].length;
  const z = a[0].length;

  const result = new Array(x);
  for (let r = 0; r < x; r++) {
    result[r] = new Array(y).fill(0);
  }

  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      for (let k = 0; k < z; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

export function multiplyMatrixByTuple(m: number[][], t: Tuple): Tuple {
  const result = [0, 0, 0, t[3]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      result[i] += m[i][j] * t[j];
    }
  }
  return result as Tuple;
}

export function transpose(m: number[][]): number[][] {
  let result: number[][] = new Array(m.length);
  for (let r = 0; r < result.length; r++) {
    result[r] = new Array(m[r].length);
    for (let c = 0; c < result[r].length; c++) {
      result[r][c] = m[c][r];
    }
  }
  return result;
}

export function determinant(m: number[][]): number {
  if (m.length === 2 && m[0].length === 2) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  }

  let det = 0;
  for (let i = 0; i < m[0].length; i++) {
    det += m[0][i] * cofactor(m, 0, i);
  }
  return det;
}

export function subMatrix(
  m: number[][],
  row: number,
  column: number
): number[][] {
  return m
    .filter((_e, i) => i !== row)
    .map((v) => v.filter((_e, i) => i !== column));
}

export function minor(m: number[][], row: number, column: number): number {
  return determinant(subMatrix(m, row, column));
}

export function cofactor(m: number[][], row: number, column: number): number {
  return (row + column) % 2 === 0
    ? minor(m, row, column)
    : -minor(m, row, column);
}

export function inverse(m: number[][]): number[][] {
  const d = determinant(m);
  if (d === 0) {
    return [];
  }
  let result: number[][] = new Array(m.length)
    .fill([])
    .map(() => new Array(m[0].length));

  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      result[c][r] = cofactor(m, r, c) / d;
    }
  }
  return result;
}
