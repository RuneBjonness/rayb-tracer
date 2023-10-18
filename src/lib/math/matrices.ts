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
  return [
    a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
    a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
    a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
    a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],

    a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
    a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
    a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
    a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],

    a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
    a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
    a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
    a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],

    a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
    a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
    a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
    a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
  ];
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
  const x00 = m[0] * m[5] - m[1] * m[4];
  const x01 = m[0] * m[6] - m[2] * m[4];
  const x02 = m[0] * m[7] - m[3] * m[4];
  const x03 = m[1] * m[6] - m[2] * m[5];
  const x04 = m[1] * m[7] - m[3] * m[5];
  const x05 = m[2] * m[7] - m[3] * m[6];
  const x06 = m[8] * m[13] - m[9] * m[12];
  const x07 = m[8] * m[14] - m[10] * m[12];
  const x08 = m[8] * m[15] - m[11] * m[12];
  const x09 = m[9] * m[14] - m[10] * m[13];
  const x10 = m[9] * m[15] - m[11] * m[13];
  const x11 = m[10] * m[15] - m[11] * m[14];

  let determinant =
    x00 * x11 - x01 * x10 + x02 * x09 + x03 * x08 - x04 * x07 + x05 * x06;
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
