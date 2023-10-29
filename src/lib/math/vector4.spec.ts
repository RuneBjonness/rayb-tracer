import { Matrix4 } from './matrices';
import { Vector4, point, vector } from './vector4';

test('two vectors are equal if no values have a difference greater than 0.00001 ', () => {
  const v1 = new Vector4(1, -1.00001, 0, 1);
  const v2 = new Vector4(1, -1.000019, 0, 1);
  expect(v1.equals(v2)).toBe(true);
});

test('two vectors are not equal if any value has a difference greater than 0.00001 ', () => {
  const v1 = new Vector4(1, -1.0, 0, 1);
  const v2 = new Vector4(1, -1.00002, 0, 1);
  expect(v1.equals(v2)).toBe(false);
});

test('point() creates a Vector4 with w=1', () => {
  const p = point(4, -4, 3);
  const vec4 = new Vector4(4, -4, 3, 1);
  expect(p.equals(vec4)).toBe(true);
});

test('vector() creates a Vector4 with w=0', () => {
  const v = vector(4, -4, 3);
  const vec4 = new Vector4(4, -4, 3, 0);
  expect(v.equals(vec4)).toBe(true);
});

test('adding two vectors', () => {
  const t = point(3, -2, 5).add(vector(-2, 3, 1));
  expect(t.equals(point(1, 1, 6))).toBe(true);
});

test('subtracting two points', () => {
  const t = point(3, 2, 1).subtract(point(5, 6, 7));
  expect(t.equals(vector(-2, -4, -6))).toBe(true);
});

test('subtracting a vector from a point', () => {
  const t = point(3, 2, 1).subtract(vector(5, 6, 7));
  expect(t.equals(point(-2, -4, -6))).toBe(true);
});

test('subtracting two vectors', () => {
  const t = vector(3, 2, 1).subtract(vector(5, 6, 7));
  expect(t.equals(vector(-2, -4, -6))).toBe(true);
});

test('subtracting a vector from the zero vector', () => {
  const t = vector(0, 0, 0).subtract(vector(1, -2, 3));
  expect(t.equals(vector(-1, 2, -3))).toBe(true);
});

test('negating a Vector4', () => {
  const t = new Vector4(1, -2, 3, -4).negate();
  expect(t.equals(new Vector4(-1, 2, -3, 4))).toBe(true);
});

test('multiplying a Vector4 by a scalar', () => {
  const t = new Vector4(1, -2, 3, -4).scale(3.5);
  expect(t.equals(new Vector4(3.5, -7, 10.5, -14))).toBe(true);
});

test('multiplying a Vector4 by a fraction', () => {
  const t = new Vector4(1, -2, 3, -4).scale(0.5);
  expect(t.equals(new Vector4(0.5, -1, 1.5, -2))).toBe(true);
});

test('dividing a Vector4 by a scalar', () => {
  const t = new Vector4(1, -2, 3, -4).divide(2);
  expect(t.equals(new Vector4(0.5, -1, 1.5, -2))).toBe(true);
});

test('computing the magnitude of vector(1, 0, 0)', () => {
  const m = vector(1, 0, 0).magnitude();
  expect(m).toBe(1);
});

test('computing the magnitude of vector(0, 1, 0)', () => {
  const m = vector(0, 1, 0).magnitude();
  expect(m).toBe(1);
});

test('computing the magnitude of vector(0, 0, 1)', () => {
  const m = vector(0, 0, 1).magnitude();
  expect(m).toBe(1);
});

test('computing the magnitude of vector(1, 2, 3)', () => {
  const m = vector(1, 2, 3).magnitude();
  expect(m).toBe(Math.sqrt(14));
});

test('computing the magnitude of vector(-1, -2, -3)', () => {
  const m = vector(-1, -2, -3).magnitude();
  expect(m).toBe(Math.sqrt(14));
});

test('normalizing vector(4, 0, 0) gives (1, 0, 0)', () => {
  const norm = vector(4, 0, 0).normalize();
  expect(norm.equals(vector(1, 0, 0))).toBe(true);
});

test('normalizing vector(1, 2, 3)', () => {
  const norm = vector(1, 2, 3).normalize();
  expect(norm.equals(vector(0.26726, 0.53452, 0.80178))).toBe(true);
});

test('magnitude of a normalized vector', () => {
  const norm = vector(1, 2, 3).normalize();
  const m = norm.magnitude();
  expect(m).toBe(1);
});

test('dot product of two vectors', () => {
  const val = vector(1, 2, 3).dot(vector(2, 3, 4));
  expect(val).toBe(20);
});

test('cross product of two vectors', () => {
  const a = vector(1, 2, 3);
  const b = vector(2, 3, 4);

  const a2 = a.clone();
  const b2 = b.clone();

  expect(a.cross(b).equals(vector(-1, 2, -1))).toBe(true);
  expect(b2.cross(a2).equals(vector(1, -2, 1))).toBe(true);
});

test('reflecting a vector approching at 45deg', () => {
  const v = vector(1, -1, 0);
  const n = vector(0, 1, 0);
  expect(v.reflect(n).equals(vector(1, 1, 0))).toBe(true);
});

test('reflecting a vector off a slanted surface', () => {
  const v = vector(0, -1, 0);
  const n = vector(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0);
  expect(v.reflect(n).equals(vector(1, 0, 0))).toBe(true);
});

test('applying a matrix', () => {
  // prettier-ignore
  const m = new Matrix4([
    1, 2, 3, 4,
    2, 4, 4, 2,
    8, 6, 4, 1,
    0, 0, 0, 1,
  ]);
  const v = point(1, 2, 3);
  const result = v.applyMatrix(m);

  expect(result.equals(point(18, 24, 33))).toBe(true);
});

test('applying the identity matrix is not changing the Vector4', () => {
  const a = new Vector4(1, 2, 3, 4);
  const result = a.applyMatrix(new Matrix4());

  expect(result.equals(new Vector4(1, 2, 3, 4))).toBe(true);
});
