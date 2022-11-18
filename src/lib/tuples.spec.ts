import {
  Tuple,
  Color,
  tuple,
  point,
  isPoint,
  isVector,
  areEqual,
  vector,
  add,
  subtract,
  negate,
  divide,
  magnitude,
  normalize,
  dot,
  cross,
  color,
  reflect,
  multiplyTupleByScalar,
  multiplyColorByScalar,
  multiplyColors,
  subtractColors,
  addColors,
} from './tuples';

test('a tuple with w=1.0 is a point', () => {
  const t = tuple(4.3, -4.2, 3.1, 1.0);
  const [x, y, z, w] = t;

  expect(x).toBe(4.3);
  expect(y).toBe(-4.2);
  expect(z).toBe(3.1);
  expect(w).toBe(1.0);

  expect(isPoint(t)).toBe(true);
  expect(isVector(t)).toBe(false);
});

test('a tuple with w=0.0 is a vector', () => {
  const t = tuple(4.3, -4.2, 3.1, 0.0);
  const [x, y, z, w] = t;

  expect(x).toBe(4.3);
  expect(y).toBe(-4.2);
  expect(z).toBe(3.1);
  expect(w).toBe(0.0);

  expect(isPoint(t)).toBe(false);
  expect(isVector(t)).toBe(true);
});

test('two tuples are equal if no values have a difference greater than 0.00001 ', () => {
  const t1: Tuple = [1, -1.00001, 0, 1];
  const t2: Tuple = [1, -1.000019, 0, 1];

  expect(areEqual(t1, t2)).toBe(true);
});

test('two tuples are not equal if any value has a difference greater than 0.00001 ', () => {
  const t1: Tuple = [1, -1.0, 0, 1];
  const t2: Tuple = [1, -1.00002, 0, 1];

  expect(areEqual(t1, t2)).toBe(false);
});

test('point() creates a tuple with w=1', () => {
  const p = point(4, -4, 3);
  const t: Tuple = [4, -4, 3, 1];

  expect(areEqual(p, t)).toBe(true);
});

test('vector() creates a tuple with w=0', () => {
  const p = vector(4, -4, 3);
  const t: Tuple = [4, -4, 3, 0];

  expect(areEqual(p, t)).toBe(true);
});

test('adding two tuples', () => {
  const t = add(point(3, -2, 5), vector(-2, 3, 1));

  expect(areEqual(t, [1, 1, 6, 1])).toBe(true);
});

test('subtracting two points', () => {
  const t = subtract(point(3, 2, 1), point(5, 6, 7));

  expect(areEqual(t, vector(-2, -4, -6))).toBe(true);
});

test('subtracting a vector from a point', () => {
  const t = subtract(point(3, 2, 1), vector(5, 6, 7));

  expect(areEqual(t, point(-2, -4, -6))).toBe(true);
});

test('subtracting two vectors', () => {
  const t = subtract(vector(3, 2, 1), vector(5, 6, 7));

  expect(areEqual(t, vector(-2, -4, -6))).toBe(true);
});

test('subtracting a vector from the zero vector', () => {
  const t = subtract(vector(0, 0, 0), vector(1, -2, 3));

  expect(areEqual(t, vector(-1, 2, -3))).toBe(true);
});

test('negating a tuple', () => {
  const t = negate(tuple(1, -2, 3, -4));

  expect(areEqual(t, tuple(-1, 2, -3, 4))).toBe(true);
});

test('multiplying a tuple by a scalar', () => {
  const t = multiplyTupleByScalar(tuple(1, -2, 3, -4), 3.5);

  expect(areEqual(t, tuple(3.5, -7, 10.5, -14))).toBe(true);
});

test('multiplying a tuple by a fraction', () => {
  const t = multiplyTupleByScalar(tuple(1, -2, 3, -4), 0.5);

  expect(areEqual(t, tuple(0.5, -1, 1.5, -2))).toBe(true);
});

test('dividing a tuple by a scalar', () => {
  const t = divide(tuple(1, -2, 3, -4), 2);

  expect(areEqual(t, tuple(0.5, -1, 1.5, -2))).toBe(true);
});

test('computing the magnitude of vector(1, 0, 0)', () => {
  const m = magnitude(vector(1, 0, 0));

  expect(m).toBe(1);
});

test('computing the magnitude of vector(0, 1, 0)', () => {
  const m = magnitude(vector(0, 1, 0));

  expect(m).toBe(1);
});

test('computing the magnitude of vector(0, 0, 1)', () => {
  const m = magnitude(vector(0, 0, 1));

  expect(m).toBe(1);
});

test('computing the magnitude of vector(1, 2, 3)', () => {
  const m = magnitude(vector(1, 2, 3));

  expect(m).toBe(Math.sqrt(14));
});

test('computing the magnitude of vector(-1, -2, -3)', () => {
  const m = magnitude(vector(-1, -2, -3));

  expect(m).toBe(Math.sqrt(14));
});

test('normalizing vector(4, 0, 0) gives (1, 0, 0)', () => {
  const norm = normalize(vector(4, 0, 0));

  expect(areEqual(norm, vector(1, 0, 0))).toBe(true);
});

test('normalizing vector(1, 2, 3)', () => {
  const norm = normalize(vector(1, 2, 3));

  expect(areEqual(norm, vector(0.26726, 0.53452, 0.80178))).toBe(true);
});

test('magnitude of a normalized vector', () => {
  const norm = normalize(vector(1, 2, 3));
  const m = magnitude(norm);

  expect(m).toBe(1);
});

test('dot product of two tuples', () => {
  const val = dot(vector(1, 2, 3), vector(2, 3, 4));

  expect(val).toBe(20);
});

test('cross product of two vectors', () => {
  const a = vector(1, 2, 3);
  const b = vector(2, 3, 4);

  expect(areEqual(cross(a, b), vector(-1, 2, -1))).toBe(true);
  expect(areEqual(cross(b, a), vector(1, -2, 1))).toBe(true);
});

test('colors are (red, green, blue) tuples', () => {
  const [r, g, b] = color(-0.5, 0.4, 1.7);

  expect(r).toBe(-0.5);
  expect(g).toBe(0.4);
  expect(b).toBe(1.7);
});

test('two colors are equal if no values have a difference greater than 0.00001 ', () => {
  const c1: Color = [1, 0.00001, 0];
  const c2: Color = [1, 0.000019, 0];

  expect(areEqual(c1, c2)).toBe(true);
});

test('two tuples are not equal if any value has a difference greater than 0.00001 ', () => {
  const c1: Color = [1, 0.00001, 0];
  const c2: Color = [1, 0.00003, 0];

  expect(areEqual(c1, c2)).toBe(false);
});

test('adding colors', () => {
  const c = addColors([0.9, 0.6, 0.75], [0.7, 0.1, 0.25]);

  expect(areEqual(c, [1.6, 0.7, 1])).toBe(true);
});

test('subtracting colors', () => {
  const c = subtractColors([0.9, 0.6, 0.75], [0.7, 0.1, 0.25]);

  expect(areEqual(c, [0.2, 0.5, 0.5])).toBe(true);
});

test('multiplying a color by a scalar', () => {
  const c = multiplyColorByScalar([0.2, 0.3, 0.4], 2);

  expect(areEqual(c, [0.4, 0.6, 0.8])).toBe(true);
});

test('multiplying colors', () => {
  const c = multiplyColors([1, 0.2, 0.4], [0.9, 1, 0.1]);

  expect(areEqual(c, [0.9, 0.2, 0.04])).toBe(true);
});

test('reflecting a vector approching at 45deg', () => {
  const v = vector(1, -1, 0);
  const n = vector(0, 1, 0);

  expect(areEqual(reflect(v, n), vector(1, 1, 0))).toBe(true);
});

test('reflecting a vector off a slanted surface', () => {
  const v = vector(0, -1, 0);
  const n = vector(Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0);

  expect(areEqual(reflect(v, n), vector(1, 0, 0))).toBe(true);
});
