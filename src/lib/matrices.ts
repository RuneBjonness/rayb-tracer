import { Tuple } from './tuples';

// prettier-ignore
export type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export function identityMatrix(): Matrix4 {
// prettier-ignore
return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

export function areEqual(m1: Matrix4, m2: Matrix4): boolean {
  const equal = function (a: number, b: number): boolean {
    return Math.abs(a - b) < 0.00001;
  };

  for (let i = 0; i < 16; i++) {
    if (equal(m1[i], m2[i]) === false) {
      return false;
    }
  }
  return true;
}

export function multiplyMatrices(a: Matrix4, b: Matrix4): Matrix4 {
// prettier-ignore
const result: Matrix4 = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i*4+j] += a[i*4+k] * b[k*4+j];
      }
    }
  }
  return result;
}

export function multiplyMatrixByTuple(m: Matrix4, t: Tuple): Tuple {
  const result = [0, 0, 0, t[3]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      result[i] += m[i*4+j] * t[j];
    }
  }
  return result as Tuple;
}

export function transpose(m: Matrix4): Matrix4 {
  // prettier-ignore
  return [
    m[0], m[4], m[8], m[12],
    m[1], m[5], m[9], m[13],
    m[2], m[6], m[10], m[14],
    m[3], m[7], m[11], m[15],
  ];
}

export function inverse(m: Matrix4): Matrix4 {
  let x00 = m[0] * m[5] - m[1] * m[4];
  let x01 = m[0] * m[6] - m[2] * m[4];
  let x02 = m[0] * m[7] - m[3] * m[4];
  let x03 = m[1] * m[6] - m[2] * m[5];
  let x04 = m[1] * m[7] - m[3] * m[5];
  let x05 = m[2] * m[7] - m[3] * m[6];
  let x06 = m[8] * m[13] - m[9] * m[12];
  let x07 = m[8] * m[14] - m[10] * m[12];
  let x08 = m[8] * m[15] - m[11] * m[12];
  let x09 = m[9] * m[14] - m[10] * m[13];
  let x10 = m[9] * m[15] - m[11] * m[13];
  let x11 = m[10] * m[15] - m[11] * m[14];

  let determinant = x00 * x11 - x01 * x10 + x02 * x09 + x03 * x08 - x04 * x07 + x05 * x06;
  if (determinant === 0) {
  // prettier-ignore
    return [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ];
  }
  determinant = 1.0 / determinant;

  return [
    (m[5] * x11 - m[6] * x10 + m[7] * x09) * determinant,
    (m[2] * x10 - m[1] * x11 - m[3] * x09) * determinant,
    (m[13] * x05 - m[14] * x04 + m[15] * x03) * determinant,
    (m[10] * x04 - m[9] * x05 - m[11] * x03) * determinant,
    (m[6] * x08 - m[4] * x11 - m[7] * x07) * determinant,
    (m[0] * x11 - m[2] * x08 + m[3] * x07) * determinant,
    (m[14] * x02 - m[12] * x05 - m[15] * x01) * determinant,
    (m[8] * x05 - m[10] * x02 + m[11] * x01) * determinant,
    (m[4] * x10 - m[5] * x08 + m[7] * x06) * determinant,
    (m[1] * x08 - m[0] * x10 - m[3] * x06) * determinant,
    (m[12] * x04 - m[13] * x02 + m[15] * x00) * determinant,
    (m[9] * x02 - m[8] * x04 - m[11] * x00) * determinant,
    (m[5] * x07 - m[4] * x09 - m[6] * x06) * determinant,
    (m[0] * x09 - m[1] * x07 + m[2] * x06) * determinant,
    (m[13] * x01 - m[12] * x03 - m[14] * x00) * determinant,
    (m[8] * x03 - m[9] * x01 + m[10] * x00) * determinant,
  ]; 
}
