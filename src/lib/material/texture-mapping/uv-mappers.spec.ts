import each from 'jest-each';
import {
  CubeBackMapper,
  CubeBottomMapper,
  CubeFrontMapper,
  CubeLeftMapper,
  CubeRightMapper,
  CubeTopMapper,
  CylindricalMapper,
  PlanarMapper,
  SphericalMapper,
} from './uv-mappers';
import { point } from '../../math/vector4';

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

each`
    p                                 | uRes     | vRes
    ${point(0, 0, -1)}                | ${0.0}   | ${0.0}
    ${point(0, 0.5, -1)}              | ${0.0}   | ${0.5}
    ${point(0, 1, -1)}                | ${0.0}   | ${0.0}
    ${point(0.70711, 0.5, -0.70711)}  | ${0.125} | ${0.5}
    ${point(1, 0.5, 0)}               | ${0.25}  | ${0.5}
    ${point(0.70711, 0.5, 0.70711)}   | ${0.375} | ${0.5}
    ${point(0, -0.25, 1)}             | ${0.5}   | ${0.75}
    ${point(-0.70711, 0.5, 0.70711)}  | ${0.625} | ${0.5}
    ${point(-1, 1.25, 0)}             | ${0.75}  | ${0.25}
    ${point(-0.70711, 0.5, -0.70711)} | ${0.875} | ${0.5}
`.test('Using a cylindrical  mapping on a 3D point', ({ p, uRes, vRes }) => {
  const m = new CylindricalMapper();
  const [u, v] = m.map(p);

  expect(u).toBeCloseTo(uRes);
  expect(v).toBeCloseTo(vRes);
});

describe('Cube face mappers', () => {
  each`
        p                       | uRes    | vRes
        ${point(-1, 0.5, -0.5)} | ${0.25} | ${0.75}
        ${point(-1, -0.5, 0.5)} | ${0.75} | ${0.25}
    `.test('left face', ({ p, uRes, vRes }) => {
    const m = new CubeLeftMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  each`
        p                      | uRes    | vRes
        ${point(-0.5, 0.5, 1)} | ${0.25} | ${0.75}
        ${point(0.5, -0.5, 1)} | ${0.75} | ${0.25}
    `.test('front face', ({ p, uRes, vRes }) => {
    const m = new CubeFrontMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  each`
        p                       | uRes    | vRes
        ${point(1, 0.5, 0.5)}   | ${0.25} | ${0.75}
        ${point(1, -0.5, -0.5)} | ${0.75} | ${0.25}
    `.test('right face', ({ p, uRes, vRes }) => {
    const m = new CubeRightMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  each`
        p                        | uRes    | vRes
        ${point(0.5, 0.5, -1)}   | ${0.25} | ${0.75}
        ${point(-0.5, -0.5, -1)} | ${0.75} | ${0.25}
    `.test('back face', ({ p, uRes, vRes }) => {
    const m = new CubeBackMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  each`
        p                       | uRes    | vRes
        ${point(-0.5, 1, -0.5)} | ${0.25} | ${0.75}
        ${point(0.5, 1, 0.5)}   | ${0.75} | ${0.25}
    `.test('top face', ({ p, uRes, vRes }) => {
    const m = new CubeTopMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  each`
        p                       | uRes    | vRes
        ${point(-0.5, -1, 0.5)} | ${0.25} | ${0.75}
        ${point(0.5, -1, -0.5)} | ${0.75} | ${0.25}
    `.test('bottom face', ({ p, uRes, vRes }) => {
    const m = new CubeBottomMapper();
    const [u, v] = m.map(p);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });
});
