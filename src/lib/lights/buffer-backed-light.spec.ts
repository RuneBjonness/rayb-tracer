import { describe, expect, test } from 'vitest';
import { Color } from '../math/color';
import { point } from '../math/vector4';
import { PointLight } from './lights';
import { toLightsArrayBuffer } from './lights-buffer';
import { bufferBackedLightArray } from './buffer-backed-light';
import { defaultBufferBackedWorld } from '../world/buffer-backed-world.spec';

describe('buffer-backed point-light', () => {
  test('a point light has a single sample position and intensity', () => {
    const position = point(0, 0, 0);
    const intensity = new Color(1, 1, 1);

    const light = new PointLight(position, intensity);

    expect(light.samplePoints()[0].equals(position)).toBe(true);
    expect(light.intensity.equals(intensity)).toBe(true);

    const lightsBuffer = toLightsArrayBuffer([light], false);
    const bufferBackedLight = bufferBackedLightArray(lightsBuffer);

    expect(bufferBackedLight.length).toBe(1);
    expect(bufferBackedLight[0].position.equals(position)).toBe(true);
    expect(bufferBackedLight[0].intensity.equals(intensity)).toBe(true);
  });

  test.each`
    p                       | result
    ${point(0, 1.0001, 0)}  | ${1.0}
    ${point(-1.0001, 0, 0)} | ${1.0}
    ${point(0, 0, -1.0001)} | ${1.0}
    ${point(0, 0, 1.0001)}  | ${0.0}
    ${point(1.0001, 0, 0)}  | ${0.0}
    ${point(0, -1.0001, 0)} | ${0.0}
    ${point(0, 0, 0)}       | ${0.0}
  `(
    'Point lights evaluate the light intensity at a given point',
    ({ p, result }) => {
      const w = defaultBufferBackedWorld();

      expect(w.lights[0].intensityAt(p, w)).toBeCloseTo(result);
    }
  );
});
