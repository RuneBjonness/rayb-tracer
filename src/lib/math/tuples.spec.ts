import {
  Color,
  areEqual,
  color,
  multiplyColorByScalar,
  multiplyColors,
  subtractColors,
  addColors,
} from './tuples';

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
