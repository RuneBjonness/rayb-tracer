import { expect, test } from 'vitest';
import { Color } from './math/color';
import { Canvas } from './canvas';

test('creating a Canvas', () => {
  const canvas = new Canvas(10, 20);

  expect(canvas.width).toBe(10);
  expect(canvas.height).toBe(20);
  expect(canvas.pixels[5][5]).toStrictEqual(new Color(0, 0, 0));
});

test('writing pixels to a Canvas', () => {
  const canvas = new Canvas(10, 20);
  const red = new Color(1, 0, 0);

  canvas.pixels[2][3] = red;
  expect(canvas.pixels[2][3]).toStrictEqual(red);
});
