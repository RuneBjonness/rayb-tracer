import each from 'jest-each';
import { color } from '../../tuples';
import { CheckersUvPattern } from './uv-patterns';

describe('uv-patterns', () => {
    const black = color(0, 0, 0);
    const white = color(1, 1, 1);

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
});
