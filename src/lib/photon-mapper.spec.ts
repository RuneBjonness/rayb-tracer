import { AreaLight, PointLight } from './lights';
import { PhotonMapper } from './photon-mapper';
import { point, vector, color } from './tuples';
import { World } from './world';

describe('photon-mapping', () => {
  test('a photon mapper calculates total light intensity from all light sources in the world', () => {
    const intensityA = 1;
    const intensityB = 0.5;
    const w = new World();
    w.lights.push(
      new PointLight(
        point(-1, 1, 0),
        color(intensityA, intensityA, intensityA)
      ),
      new AreaLight(color(intensityB, intensityB, intensityB), 1, 1)
    );

    const photonMapper = new PhotonMapper(w, 1000);

    expect(photonMapper.totalLightIntensity).toBeCloseTo(
      3 * intensityA + 3 * intensityB
    );
  });

  test('a photon mapper distributes total light intensity evenly on photons', () => {
    const w = new World();
    w.lights.push(new PointLight(point(-1, 1, 0), color(1, 1, 1)));

    const photonMapper = new PhotonMapper(w, 1000);

    expect(photonMapper.totalLightIntensity).toBeCloseTo(3);
    expect(photonMapper.photonPowerFactor).toBeCloseTo(0.003);
  });
});
