import each from 'jest-each';
import { AreaLight, PointLight } from './lights';
import { multiplyMatrices } from './matrices';
import { radians, rotationX, rotationZ, translation } from './transformations';
import { addColors, areEqual, color, point, vector } from './tuples';
import { defaultWorld } from './world';

describe('point-light', () => {
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
});

describe('area-light', () => {
  test('an area light with no transformation spans from (-1,y,-1) to (1,y,1) where y is close to 0', () => {
    const intensity = color(1, 1, 1);

    const light = new AreaLight(intensity, 50, 1);
    const samples = light.samplePoints();

    const minXpos = Math.min(...samples.map((s) => s[0]));
    const maxXpos = Math.max(...samples.map((s) => s[0]));
    const minZpos = Math.min(...samples.map((s) => s[2]));
    const maxZpos = Math.max(...samples.map((s) => s[2]));

    expect(minXpos).toBeGreaterThanOrEqual(-1);
    expect(minXpos).toBeLessThanOrEqual(-0.5);
    expect(maxXpos).toBeGreaterThanOrEqual(0.5);
    expect(maxXpos).toBeLessThanOrEqual(1);

    expect(minZpos).toBeGreaterThanOrEqual(-1);
    expect(minZpos).toBeLessThanOrEqual(-0.5);
    expect(maxZpos).toBeGreaterThanOrEqual(0.5);
    expect(maxZpos).toBeLessThanOrEqual(1);

    expect(samples.every((s) => s[1] < 0.01 && s[1] > -0.01)).toBe(true);
    expect(areEqual(light.intensity, intensity)).toBe(true);
  });

  test('an area light can be transformed', () => {
    const light = new AreaLight(color(1, 1, 1), 50, 1);
    light.transform = multiplyMatrices(
      translation(-5, 0, 0),
      rotationZ(radians(90))
    );

    const samples = light.samplePoints();

    const minYpos = Math.min(...samples.map((s) => s[1]));
    const maxYpos = Math.max(...samples.map((s) => s[1]));
    const minZpos = Math.min(...samples.map((s) => s[2]));
    const maxZpos = Math.max(...samples.map((s) => s[2]));

    expect(minYpos).toBeGreaterThanOrEqual(-1);
    expect(minYpos).toBeLessThanOrEqual(-0.5);
    expect(maxYpos).toBeGreaterThanOrEqual(0.5);
    expect(maxYpos).toBeLessThanOrEqual(1);

    expect(minZpos).toBeGreaterThanOrEqual(-1);
    expect(minZpos).toBeLessThanOrEqual(-0.5);
    expect(maxZpos).toBeGreaterThanOrEqual(0.5);
    expect(maxZpos).toBeLessThanOrEqual(1);

    expect(samples.every((s) => s[0] < -4.99 && s[0] > -5.01)).toBe(true);
  });

  test('an area light has a single intensity', () => {
    const intensity = color(1, 1, 1);
    const light = new AreaLight(intensity, 1, 1);

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
      const l = new AreaLight(color(1, 1, 1), 1, 1);
      l.transform = translation(-10.5, 9.5, -10);
      const w = defaultWorld();
      w.lights[0] = l;

      expect(w.lights[0].intensityAt(p, w)).toBeCloseTo(result);
    }
  );

  each`
    p                       | result
    ${point(0, 0, 2)}       | ${0.0}
    ${point(1, -1, 3)}      | ${0.2}
    ${point(1.5, 0, 2)}     | ${0.4}
    ${point(1.25, 1.25, 3)} | ${0.6}
    ${point(0, 0, -2)}      | ${1.0}
`.test(
    'Area lights evaluate the average light intensity at a given point based on an evenly distributed collection of samples',
    ({ p, result }) => {
      const l = new AreaLight(color(1, 1, 1), 5, 1);
      l.transform = multiplyMatrices(
        translation(-0.5, 0, -5),
        rotationX(radians(90))
      );
      const w = defaultWorld();
      w.lights[0] = l;

      // To be able to test, make random() be less random..
      Math.random = () => 0.5;

      expect(w.lights[0].intensityAt(p, w)).toBeCloseTo(result);
    }
  );
});

describe('photon-mapping: point-light', () => {
  const position = point(0, 0, 0);
  const intensity = color(1, 0, 0.5);

  const light = new PointLight(position, intensity);
  const photons = light.emitPhotons(100, 0.01);

  test('a point light emits all photons from its own position', () => {
    expect(photons.length).toEqual(100);
    expect(areEqual(photons[0].position, position)).toBe(true);
    expect(areEqual(photons[15].position, position)).toBe(true);
  });

  test('a point light emits photons randomly in every direction', () => {
    expect(areEqual(photons[1].direction, photons[2].direction)).not.toBe(true);
    expect(areEqual(photons[3].direction, photons[4].direction)).not.toBe(true);
  });

  test('the intesity of a point light is evenly distributed on all emitted photons ', () => {
    expect(
      areEqual(
        photons.map((p) => p.power).reduce((a, b) => addColors(a, b)),
        light.intensity
      )
    ).toBe(true);
  });
});

describe('photon-mapping: area-light', () => {
  const intensity = color(1, 0, 0.5);

  const light = new AreaLight(intensity, 5, 1);
  const photons = light.emitPhotons(100, 0.01);

  test('an area light emits photons from its entire area', () => {
    expect(photons.length).toEqual(100);
    const minXpos = Math.min(...photons.map((p) => p.position[0]));
    const maxXpos = Math.max(...photons.map((p) => p.position[0]));
    const minZpos = Math.min(...photons.map((p) => p.position[2]));
    const maxZpos = Math.max(...photons.map((p) => p.position[2]));

    expect(minXpos).toBeGreaterThanOrEqual(-1);
    expect(minXpos).toBeLessThanOrEqual(-0.5);
    expect(maxXpos).toBeGreaterThanOrEqual(0.5);
    expect(maxXpos).toBeLessThanOrEqual(1);

    expect(minZpos).toBeGreaterThanOrEqual(-1);
    expect(minZpos).toBeLessThanOrEqual(-0.5);
    expect(maxZpos).toBeGreaterThanOrEqual(0.5);
    expect(maxZpos).toBeLessThanOrEqual(1);
  });

  test('an area light emits photons in random directions limited to a hemisphere on the active side', () => {
    expect(areEqual(photons[1].direction, photons[2].direction)).not.toBe(true);
    expect(areEqual(photons[3].direction, photons[4].direction)).not.toBe(true);

    expect(photons.map((x) => x.direction[1]).every((y) => y < 0)).toBe(true);
  });

  test('the intesity of an area light is evenly distributed on all emitted photons ', () => {
    expect(
      areEqual(
        photons.map((p) => p.power).reduce((a, b) => addColors(a, b)),
        light.intensity
      )
    ).toBe(true);
  });
});
