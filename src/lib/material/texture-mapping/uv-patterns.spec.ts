import { describe, expect, test } from 'vitest';
import { Color } from '../../math/color';
import { CheckersUvPattern, ImageUvPattern } from './uv-patterns';
import { Canvas } from '../../canvas';

describe('uv-patterns', () => {
  const black = new Color(0, 0, 0);
  const gray = new Color(0.5, 0.5, 0.5);
  const white = new Color(1, 1, 1);
  const red = new Color(1, 0, 0);

  test.each`
    u      | v      | result
    ${0.0} | ${0.0} | ${black}
    ${0.5} | ${0.0} | ${white}
    ${0.0} | ${0.5} | ${white}
    ${0.5} | ${0.5} | ${black}
    ${1.0} | ${1.0} | ${black}
  `('Checker pattern in 2D', ({ u, v, result }) => {
    const p = new CheckersUvPattern(2, 2, black, white);

    expect(p.colorAt(u, v)).toEqual(result);
  });

  test.each`
    u      | v      | result
    ${0.0} | ${0.0} | ${black}
    ${0.3} | ${0.0} | ${gray}
    ${0.3} | ${0.6} | ${gray}
    ${1.0} | ${1.0} | ${white}
  `('Image pattern in 2D', ({ u, v, result }) => {
    const canvas = new Canvas(10, 10);
    canvas.setColor(0, 9, black);
    canvas.setColor(3, 9, gray);
    canvas.setColor(3, 4, gray);
    canvas.setColor(9, 0, white);
    const p = new ImageUvPattern(canvas);

    expect(p.colorAt(u, v)).toEqual(result);
  });
});
