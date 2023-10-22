import each from 'jest-each';
import { Color } from '../../math/color';
import { CheckersUvPattern, ImageUvPattern } from './uv-patterns';

describe('uv-patterns', () => {
  const black = new Color(0, 0, 0);
  const gray = new Color(0.5, 0.5, 0.5);
  const white = new Color(1, 1, 1);
  const red = new Color(1, 0, 0);

  each`
        u      | v      | result
        ${0.0} | ${0.0} | ${black}
        ${0.5} | ${0.0} | ${white}
        ${0.0} | ${0.5} | ${white}
        ${0.5} | ${0.5} | ${black}
        ${1.0} | ${1.0} | ${black}
    `.test('Checker pattern in 2D', ({ u, v, result }) => {
    const p = new CheckersUvPattern(2, 2, black, white);

    expect(p.colorAt(u, v)).toEqual(result);
  });

  each`
        u      | v      | result
        ${0.0} | ${0.0} | ${black}
        ${0.3} | ${0.0} | ${gray}
        ${0.3} | ${0.6} | ${gray}
        ${1.0} | ${1.0} | ${white}
    `.test('Image pattern in 2D', ({ u, v, result }) => {
    const p = new ImageUvPattern([
      [red, red, red, red, red, red, red, red, red, black],
      [red, red, red, red, red, red, red, red, red, red],
      [red, red, red, red, red, red, red, red, red, red],
      [red, red, red, red, gray, red, red, red, red, gray],
      [red, red, red, red, red, red, red, red, red, red],
      [red, red, red, red, red, red, red, red, red, red],
      [red, red, red, red, red, red, red, red, red, red],
      [red, red, red, red, red, red, red, red, red, red],
      [red, red, red, red, red, red, red, red, red, red],
      [white, red, red, red, red, red, red, red, red, red],
    ]);

    expect(p.colorAt(u, v)).toEqual(result);
  });
});
