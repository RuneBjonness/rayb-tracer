import each from 'jest-each';
import { AreaLight, PointLight } from './lights';
import { areEqual, color, point, vector } from './tuples';
import { defaultWorld } from './world';

test('a point light has a single sample position and intensity', () => {
  const position = point(0, 0, 0);
  const intensity = color(1, 1, 1);

  const light = new PointLight(position, intensity);

  expect(areEqual(light.samplePoints()[0], position)).toBe(true);
  expect(areEqual(light.intensity, intensity)).toBe(true);
});

each`
    p                       | result
    ${point(0, 1.0001, 0)}  | ${1.0}
    ${point(-1.0001, 0, 0)} | ${1.0}
    ${point(0, 0, -1.0001)} | ${1.0}
    ${point(0, 0, 1.0001)}  | ${0.0}
    ${point(1.0001, 0, 0)}  | ${0.0}
    ${point(0, -1.0001, 0)} | ${0.0}
    ${point(0, 0, 0)}       | ${0.0}
`.test(
  'Point lights evaluate the light intensity at a given point',
  ({ p, result }) => {
    const w = defaultWorld();

    expect(w.lights[0].intensityAt(p, w)).toBeCloseTo(result);
  }
);

test('an area light has a single sample position at its center and a single intensity', () => {
  const position = point(0, 0, 0);
  const intensity = color(1, 1, 1);

  const light = new AreaLight(
    point(-0.5, -0.5, 0),
    vector(1, 0, 0),
    vector(0, 1, 0),
    intensity,
    1,
    1
  );

  expect(areEqual(light.samplePoints()[0], position)).toBe(true);
  expect(areEqual(light.intensity, intensity)).toBe(true);
});

each`
    p                       | result
    ${point(0, 1.0001, 0)}  | ${1.0}
    ${point(-1.0001, 0, 0)} | ${1.0}
    ${point(0, 0, -1.0001)} | ${1.0}
    ${point(0, 0, 1.0001)}  | ${0.0}
    ${point(1.0001, 0, 0)}  | ${0.0}
    ${point(0, -1.0001, 0)} | ${0.0}
    ${point(0, 0, 0)}       | ${0.0}
`.test(
  'Area lights with maxSamples=1 evaluate the light intensity at a given point as if it were a point light placed in its center',
  ({ p, result }) => {
    const w = defaultWorld();
    w.lights[0] = new AreaLight(
      point(-10.5, 9.5, -10),
      vector(1, 0, 0),
      vector(0, 1, 0),
      color(1, 1, 1),
      1,
      1
    );

    expect(w.lights[0].intensityAt(p, w)).toBeCloseTo(result);
  }
);

each`
    p                       | result
    ${point(0, 0, 2)}       | ${0.0}
    ${point(1, -1, 3)}      | ${0.25}
    ${point(1.5, 0, 2)}     | ${0.5}
    ${point(1.25, 1.25, 3)} | ${0.75}
    ${point(0, 0, -2)}      | ${1.0}
`.test(
  'Area lights evaluate the average light intensity at a given point based on an evenly distributed collection of samples',
  ({ p, result }) => {
    const w = defaultWorld();
    w.lights[0] = new AreaLight(
      point(-0.5, -0.5, -5),
      vector(1, 0, 0),
      vector(0, 1, 0),
      color(1, 1, 1),
      4,
      1
    );

    // To be able to test, make random() be less random..
    Math.random = () => 0.5;

    expect(w.lights[0].intensityAt(p, w)).toBeCloseTo(result);
  }
);
