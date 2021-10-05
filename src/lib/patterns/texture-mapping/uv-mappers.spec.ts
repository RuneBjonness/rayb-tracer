import each from 'jest-each';
import { point } from '../../tuples';
import { PlanarMapper, SphericalMapper } from './uv-mappers';

each`
    p                                       | uRes    | vRes
    ${point(0, 0, -1)}                      | ${0.0}  | ${0.5}
    ${point(1, 0, 0)}                       | ${0.25} | ${0.5}
    ${point(0, 0, 1)}                       | ${0.5}  | ${0.5}
    ${point(-1, 0, 0)}                      | ${0.75} | ${0.5}
    ${point(0, 1, 0)}                       | ${0.5}  | ${1.0}
    ${point(0, -1, 0)}                      | ${0.5}  | ${0.0}
    ${point(Math.SQRT2 / 2, Math.SQRT2 / 2, 0)} | ${0.25} | ${0.75}
`.test('Using a spherical mapping on a 3D point', ({ p, uRes, vRes }) => {
    const m = new SphericalMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
});

each`
    p                           | uRes    | vRes
    ${point(0.25, 0, 0.5)}      | ${0.25} | ${0.5}
    ${point(0.25, 0, -0.25)}    | ${0.25} | ${0.75}
    ${point(0.25, 0.5, -0.25)}  | ${0.25} | ${0.75}
    ${point(1.25, 0, 0.5)}      | ${0.25} | ${0.5}
    ${point(0.25, 0, -1.75)}    | ${0.25} | ${0.25}
    ${point(1, 0, -1)}          | ${0.0}  | ${0.0}
    ${point(0, 0, 0)}           | ${0.0}  | ${0.0}
`.test('Using a planar mapping on a 3D point', ({ p, uRes, vRes }) => {
    const m = new PlanarMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
});
