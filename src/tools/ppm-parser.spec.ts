import { expect, test } from 'vitest';
import { parsePPM } from './ppm-parser';

test('Reading a PPM returns a canvas of the right size', () => {
  const canvas = parsePPM(`P3
10 2
255
0 0 0  0 0 0  0 0 0  0 0 0  0 0 0
0 0 0  0 0 0  0 0 0  0 0 0  0 0 0
0 0 0  0 0 0  0 0 0  0 0 0  0 0 0
0 0 0  0 0 0  0 0 0  0 0 0  0 0 0`);

  expect(canvas.width).toEqual(10);
  expect(canvas.height).toEqual(2);
});

test.each`
  x    | y    | color
  ${0} | ${0} | ${[1, 0.498, 0]}
  ${1} | ${0} | ${[0, 0.498, 1]}
  ${2} | ${0} | ${[0.498, 1, 0]}
  ${3} | ${0} | ${[1, 1, 1]}
  ${0} | ${1} | ${[0, 0, 0]}
  ${1} | ${1} | ${[1, 0, 0]}
  ${2} | ${1} | ${[0, 1, 0]}
  ${3} | ${1} | ${[0, 0, 1]}
  ${0} | ${2} | ${[1, 1, 0]}
  ${1} | ${2} | ${[0, 1, 1]}
  ${2} | ${2} | ${[1, 0, 1]}
  ${3} | ${2} | ${[0.498, 0.498, 0.498]}
`('Reading pixel data from a PPM file', ({ x, y, color }) => {
  const canvas = parsePPM(`P3
4 3
255
255 127 0  0 127 255  127 255 0  255 255 255
0 0 0  255 0 0  0 255 0  0 0 255
255 255 0  0 255 255  255 0 255  127 127 127`);

  expect(canvas.getColor(x, y).r).toBeCloseTo(color[0]);
  expect(canvas.getColor(x, y).g).toBeCloseTo(color[1]);
  expect(canvas.getColor(x, y).b).toBeCloseTo(color[2]);
});
