import { describe, expect, test } from 'vitest';
import { point } from '../../math/vector4';
import { UvMapper, map } from './uv-mappers';

test.each`
  p                                           | uRes    | vRes
  ${point(0, 0, -1)}                          | ${0.0}  | ${0.5}
  ${point(1, 0, 0)}                           | ${0.25} | ${0.5}
  ${point(0, 0, 1)}                           | ${0.5}  | ${0.5}
  ${point(-1, 0, 0)}                          | ${0.75} | ${0.5}
  ${point(0, 1, 0)}                           | ${0.5}  | ${1.0}
  ${point(0, -1, 0)}                          | ${0.5}  | ${0.0}
  ${point(Math.SQRT2 / 2, Math.SQRT2 / 2, 0)} | ${0.25} | ${0.75}
`('Using a spherical mapping on a 3D point', ({ p, uRes, vRes }) => {
  const [u, v] = map(p, UvMapper.Spherical);

  expect(u).toBeCloseTo(uRes);
  expect(v).toBeCloseTo(vRes);
});

test.each`
  p                          | uRes    | vRes
  ${point(0.25, 0, 0.5)}     | ${0.25} | ${0.5}
  ${point(0.25, 0, -0.25)}   | ${0.25} | ${0.75}
  ${point(0.25, 0.5, -0.25)} | ${0.25} | ${0.75}
  ${point(1.25, 0, 0.5)}     | ${0.25} | ${0.5}
  ${point(0.25, 0, -1.75)}   | ${0.25} | ${0.25}
  ${point(1, 0, -1)}         | ${0.0}  | ${0.0}
  ${point(0, 0, 0)}          | ${0.0}  | ${0.0}
`('Using a planar mapping on a 3D point', ({ p, uRes, vRes }) => {
  const [u, v] = map(p, UvMapper.Planar);

  expect(u).toBeCloseTo(uRes);
  expect(v).toBeCloseTo(vRes);
});

test.each`
  p                                           | uRes     | vRes
  ${point(0, 0, -1)}                          | ${0.0}   | ${0.0}
  ${point(0, 0.5, -1)}                        | ${0.0}   | ${0.5}
  ${point(0, 1, -1)}                          | ${0.0}   | ${0.0}
  ${point(Math.SQRT1_2, 0.5, -Math.SQRT1_2)}  | ${0.125} | ${0.5}
  ${point(1, 0.5, 0)}                         | ${0.25}  | ${0.5}
  ${point(Math.SQRT1_2, 0.5, Math.SQRT1_2)}   | ${0.375} | ${0.5}
  ${point(0, -0.25, 1)}                       | ${0.5}   | ${0.75}
  ${point(-Math.SQRT1_2, 0.5, Math.SQRT1_2)}  | ${0.625} | ${0.5}
  ${point(-1, 1.25, 0)}                       | ${0.75}  | ${0.25}
  ${point(-Math.SQRT1_2, 0.5, -Math.SQRT1_2)} | ${0.875} | ${0.5}
`('Using a cylindrical  mapping on a 3D point', ({ p, uRes, vRes }) => {
  const [u, v] = map(p, UvMapper.Cylindrical);

  expect(u).toBeCloseTo(uRes);
  expect(v).toBeCloseTo(vRes);
});

describe('Cube face mappers', () => {
  test.each`
    p                       | uRes    | vRes
    ${point(-1, 0.5, -0.5)} | ${0.25} | ${0.75}
    ${point(-1, -0.5, 0.5)} | ${0.75} | ${0.25}
  `('left face', ({ p, uRes, vRes }) => {
    const [u, v] = map(p, UvMapper.CubeLeft);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  test.each`
    p                      | uRes    | vRes
    ${point(-0.5, 0.5, 1)} | ${0.25} | ${0.75}
    ${point(0.5, -0.5, 1)} | ${0.75} | ${0.25}
  `('front face', ({ p, uRes, vRes }) => {
    const [u, v] = map(p, UvMapper.CubeFront);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  test.each`
    p                       | uRes    | vRes
    ${point(1, 0.5, 0.5)}   | ${0.25} | ${0.75}
    ${point(1, -0.5, -0.5)} | ${0.75} | ${0.25}
  `('right face', ({ p, uRes, vRes }) => {
    const [u, v] = map(p, UvMapper.CubeRight);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  test.each`
    p                        | uRes    | vRes
    ${point(0.5, 0.5, -1)}   | ${0.25} | ${0.75}
    ${point(-0.5, -0.5, -1)} | ${0.75} | ${0.25}
  `('back face', ({ p, uRes, vRes }) => {
    const [u, v] = map(p, UvMapper.CubeBack);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  test.each`
    p                       | uRes    | vRes
    ${point(-0.5, 1, -0.5)} | ${0.25} | ${0.75}
    ${point(0.5, 1, 0.5)}   | ${0.75} | ${0.25}
  `('top face', ({ p, uRes, vRes }) => {
    const [u, v] = map(p, UvMapper.CubeTop);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });

  test.each`
    p                       | uRes    | vRes
    ${point(-0.5, -1, 0.5)} | ${0.25} | ${0.75}
    ${point(0.5, -1, -0.5)} | ${0.75} | ${0.25}
  `('bottom face', ({ p, uRes, vRes }) => {
    const [u, v] = map(p, UvMapper.CubeBottom);

    expect(u).toBeCloseTo(uRes);
    expect(v).toBeCloseTo(vRes);
  });
});
