import { describe, expect, test } from 'vitest';
import { Matrix4 } from './matrices';
import { Vector4, point } from './vector4';

test('constructing and inspecting a 4x4 matrix', () => {
  // prettier-ignore
  const m = new Matrix4([
    1, 2, 3, 4,
    5.5, 6.5, 7.5, 8.5,
    9, 10, 11, 12,
    13.5, 14.5, 15.5, 16.5,
  ]);

  expect(m.elements[0]).toBe(1);
  expect(m.elements[3]).toBe(4);
  expect(m.elements[4]).toBe(5.5);
  expect(m.elements[6]).toBe(7.5);
  expect(m.elements[10]).toBe(11);
  expect(m.elements[12]).toBe(13.5);
  expect(m.elements[14]).toBe(15.5);
});

test('two matrices are equal if no values have a difference greater than 0.00001', () => {
  // prettier-ignore
  const m1 = new Matrix4([
    1, 2, 3, 4,
    5.5, 6.5, 7.5, 8.5,
    9, 10, 11, 12,
    13.5, 14.5, 15.5, 16.5,
  ]);
  // prettier-ignore
  const m2 = new Matrix4([
    1, 2, 3, 4,
    5.5, 6.5, 7.5, 8.499999,
    9, 10, 11, 12,
    13.5, 14.5, 15.5, 16.5,
  ]);

  expect(m1.equals(m2)).toBe(true);
});

test('two matrices are not equal if any value has a difference greater than 0.00001', () => {
  // prettier-ignore
  const m1 = new Matrix4([
    1, 2, 3, 4,
    5.5, 6.5, 7.5, 8.5,
    9, 10, 11, 12,
    13.5, 14.5, 15.5, 16.5,
  ]);
  // prettier-ignore
  const m2 = new Matrix4([
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10, 11, 12,
    13.5, 14.5, 15.5, 16.5,
  ]);

  expect(m1.equals(m2)).toBe(false);
});

test('multiplying two matrices', () => {
  // prettier-ignore
  const m1 = new Matrix4([
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 8, 7, 6,
    5, 4, 3, 2,
  ]);
  // prettier-ignore
  const m2 = new Matrix4([
    -2, 1, 2, 3,
    3, 2, 1, -1,
    4, 3, 6, 5,
    1, 2, 7, 8,
  ]);
  // prettier-ignore
  const expected = new Matrix4([
    20, 22, 50, 48,
    44, 54, 114, 108,
    40, 58, 110, 102,
    16, 26, 46, 42,
  ]);

  m1.multiply(m2);

  expect(expected.equals(m1)).toBe(true);
});

test('multiplying a matrix with a tuple', () => {
  // prettier-ignore
  const m = new Matrix4([
    1, 2, 3, 4,
    2, 4, 4, 2,
    8, 6, 4, 1,
    0, 0, 0, 1,
  ]);
  const b = point(1, 2, 3);

  const result = b.applyMatrix(m);

  expect(result.equals(point(18, 24, 33))).toBe(true);
});

test('multiplying a matrix by the identity matrix', () => {
  // prettier-ignore
  const m = new Matrix4([
    0, 1, 2, 4,
    1, 2, 4, 8,
    2, 4, 8, 16,
    4, 8, 16, 32,
  ]);

  const identity = new Matrix4();
  const result = m.clone().multiply(identity);

  expect(m.equals(result)).toBe(true);
});

test('multiplying the identity matrix by a tuple', () => {
  const a = new Vector4(1, 2, 3, 4);

  const result = a.clone().applyMatrix(new Matrix4());

  expect(result.equals(a)).toBe(true);
});

test('transposing a matrix', () => {
  // prettier-ignore
  const m = new Matrix4([
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 8, 7, 6,
    5, 4, 3, 2,
  ]);

  // prettier-ignore
  const expected = new Matrix4([
    1, 5, 9, 5,
    2, 6, 8, 4,
    3, 7, 7, 3,
    4, 8, 6, 2,
  ]);

  m.transpose();

  expect(expected.equals(m)).toBe(true);
});

test('transposing the identity matrix', () => {
  const result = new Matrix4().transpose();

  expect(new Matrix4().equals(result)).toBe(true);
});

describe('matrix invertibility', () => {
  // prettier-ignore
  const nullMatrix = new Matrix4([
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
  ]);

  test('testing an invertible matrix for invertibility', () => {
    // prettier-ignore
    const m = new Matrix4([
      6, 4, 4, 4,
      5, 5, 7, 6,
      4, -9, 3, -7,
      9, 1, 7, -6,
    ]);

    expect(nullMatrix.equals(m.inverse())).toBe(false);
  });

  test('testing a noninvertible matrix for invertibility', () => {
    // prettier-ignore
    const m = new Matrix4([
      -4, 2, -2, -3,
      9, 6, 2, 6,
      0, -5, 1, -5,
      0, 0, 0, 0,
    ]);

    expect(nullMatrix.equals(m.inverse())).toBe(true);
  });
});

test('calculating the inverse of a matrix', () => {
  // prettier-ignore
  const m1 = new Matrix4([
    -5, 2, 6, -8,
    1, -5, 1, 8,
    7, 7, -6, -7,
    1, -3, 7, 4,
  ]);

  const m2 = m1.clone().inverse();

  // prettier-ignore
  const m1inverted = new Matrix4([
    0.21805, 0.45113, 0.2406, -0.04511,
    -0.80827, -1.45677, -0.44361, 0.52068,
    -0.07895, -0.22368, -0.05263, 0.19737,
    -0.52256, -0.81391, -0.30075, 0.30639,
  ]);

  expect(m2.elements[14]).toEqual(-160 / 532);
  expect(m2.elements[11]).toEqual(105 / 532);
  expect(m1inverted.equals(m2)).toBe(true);
});

test('calculating the inverse of another matrix', () => {
  // prettier-ignore
  const m1 = new Matrix4([
    8, -5, 9, 2,
    7, 5, 6, 1,
    -6, 0, 9, 6,
    -3, 0, -9, -4,
  ]);
  // prettier-ignore
  const m1inverted = new Matrix4([
    -0.15385, -0.15385, -0.28205, -0.53846,
    -0.07692, 0.12308, 0.02564, 0.03077,
    0.35897, 0.35897, 0.4359, 0.92308,
    -0.69231, -0.69231, -0.76923, -1.92308,
  ]);
  const m2 = m1.clone().inverse();

  expect(m1inverted.equals(m2)).toBe(true);
});

test('calculating the inverse of yet another matrix', () => {
  // prettier-ignore
  const m1 = new Matrix4([
    9, 3, 0, 9,
    -5, -2, -6, -3,
    -4, 9, 6, 4,
    -7, 6, 6, 2,
  ]);
  // prettier-ignore
  const m1inverted = new Matrix4([
    -0.04074, -0.07778, 0.14444, -0.22222,
    -0.07778, 0.03333, 0.36667, -0.33333,
    -0.02901, -0.1463, -0.10926, 0.12963,
    0.17778, 0.06667, -0.26667, 0.33333,
  ]);
  const m2 = m1.clone().inverse();

  expect(m1inverted.equals(m2)).toBe(true);
});

test('multiplying a product by its inverse', () => {
  // prettier-ignore
  const m1 = new Matrix4([
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 8, 7, 6,
    5, 4, 3, 2,
  ]);

  // prettier-ignore
  const m2 = new Matrix4([
    -2, 1, 2, 3,
    3, 2, 1, -1,
    4, 3, 6, 5,
    1, 2, 7, 8,
  ]);

  const prod = m1.clone().multiply(m2);
  const result = prod.multiply(m2.inverse());

  expect(m1.equals(result)).toBe(true);
});
