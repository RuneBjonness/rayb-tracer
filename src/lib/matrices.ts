import { Tuple } from './tuples';

// prettier-ignore
export type Matrix4 = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];

export function identityMatrix(): Matrix4 {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

export function areEqual(m1: Matrix4, m2: Matrix4): boolean {
  const equal = function (a: number, b: number): boolean {
    return Math.abs(a - b) < 0.00001;
  };

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (equal(m1[r][c], m2[r][c]) === false) {
        return false;
      }
    }
  }
  return true;
}

export function multiplyMatrices(a: Matrix4, b: Matrix4): Matrix4 {
  const result: Matrix4 = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

export function multiplyMatrixByTuple(m: Matrix4, t: Tuple): Tuple {
  const result = [0, 0, 0, t[3]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      result[i] += m[i][j] * t[j];
    }
  }
  return result as Tuple;
}

export function transpose(m: Matrix4): Matrix4 {
  return [
    [m[0][0], m[1][0], m[2][0], m[3][0]],
    [m[0][1], m[1][1], m[2][1], m[3][1]],
    [m[0][2], m[1][2], m[2][2], m[3][2]],
    [m[0][3], m[1][3], m[2][3], m[3][3]],
  ];
}

export function inverse(m: Matrix4): Matrix4 {
  let x00 = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let x01 = m[0][0] * m[1][2] - m[0][2] * m[1][0];
  let x02 = m[0][0] * m[1][3] - m[0][3] * m[1][0];
  let x03 = m[0][1] * m[1][2] - m[0][2] * m[1][1];
  let x04 = m[0][1] * m[1][3] - m[0][3] * m[1][1];
  let x05 = m[0][2] * m[1][3] - m[0][3] * m[1][2];
  let x06 = m[2][0] * m[3][1] - m[2][1] * m[3][0];
  let x07 = m[2][0] * m[3][2] - m[2][2] * m[3][0];
  let x08 = m[2][0] * m[3][3] - m[2][3] * m[3][0];
  let x09 = m[2][1] * m[3][2] - m[2][2] * m[3][1];
  let x10 = m[2][1] * m[3][3] - m[2][3] * m[3][1];
  let x11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];

  let determinant = x00 * x11 - x01 * x10 + x02 * x09 + x03 * x08 - x04 * x07 + x05 * x06;
  if (determinant === 0) {
    return [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  }
  determinant = 1.0 / determinant;

  return [
    [
      (m[1][1] * x11 - m[1][2] * x10 + m[1][3] * x09) * determinant,
      (m[0][2] * x10 - m[0][1] * x11 - m[0][3] * x09) * determinant,
      (m[3][1] * x05 - m[3][2] * x04 + m[3][3] * x03) * determinant,
      (m[2][2] * x04 - m[2][1] * x05 - m[2][3] * x03) * determinant,
    ],
    [
      (m[1][2] * x08 - m[1][0] * x11 - m[1][3] * x07) * determinant,
      (m[0][0] * x11 - m[0][2] * x08 + m[0][3] * x07) * determinant,
      (m[3][2] * x02 - m[3][0] * x05 - m[3][3] * x01) * determinant,
      (m[2][0] * x05 - m[2][2] * x02 + m[2][3] * x01) * determinant,
    ],
    [
      (m[1][0] * x10 - m[1][1] * x08 + m[1][3] * x06) * determinant,
      (m[0][1] * x08 - m[0][0] * x10 - m[0][3] * x06) * determinant,
      (m[3][0] * x04 - m[3][1] * x02 + m[3][3] * x00) * determinant,
      (m[2][1] * x02 - m[2][0] * x04 - m[2][3] * x00) * determinant,
    ],
    [
      (m[1][1] * x07 - m[1][0] * x09 - m[1][2] * x06) * determinant,
      (m[0][0] * x09 - m[0][1] * x07 + m[0][2] * x06) * determinant,
      (m[3][1] * x01 - m[3][0] * x03 - m[3][2] * x00) * determinant,
      (m[2][0] * x03 - m[2][1] * x01 + m[2][2] * x00) * determinant,
    ],
  ]; 
}
