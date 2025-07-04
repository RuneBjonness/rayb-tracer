import { describe, expect, test } from 'vitest';
import { AreaLight, PointLight } from './lights/lights';
import { PhotonMapper } from './photon-mapper';
import { TransformableSphere } from './shapes/primitives/sphere';
import { scaling } from './math/transformations';
import { Color } from './math/color';
import { World } from './world/world';
import { point } from './math/vector4';
import { material } from './material/materials';

describe('photon-mapping', () => {
  test('a photon mapper calculates total light intensity from all light sources in the world', () => {
    const intensityA = 1;
    const intensityB = 0.5;
    const w = new World();
    w.lights.push(
      new PointLight(
        point(-1, 1, 0),
        new Color(intensityA, intensityA, intensityA)
      ),
      new AreaLight(new Color(intensityB, intensityB, intensityB), 1, 1, [])
    );

    const photonMapper = new PhotonMapper(w, 1000);

    expect(photonMapper.totalLightIntensity).toBeCloseTo(
      3 * intensityA + 3 * intensityB
    );
  });

  test('a photon mapper distributes total light intensity evenly on photons', () => {
    const w = new World();
    w.lights.push(new PointLight(point(-1, 1, 0), new Color(1, 1, 1)));

    const photonMapper = new PhotonMapper(w, 1000);

    expect(photonMapper.totalLightIntensity).toBeCloseTo(3);
    expect(photonMapper.photonPowerFactor).toBeCloseTo(0.003);
  });

  test('a photon mapper calculates global illumination by tracing photons and storing diffuse reflections', () => {
    const w = new World();
    w.lights.push(new PointLight(point(0, 0, 0), new Color(1, 1, 1)));

    const s = new TransformableSphere();
    s.material.diffuse = 1;
    w.objects.push(s);

    const photonMapper = new PhotonMapper(w, 10, 2);
    const result = photonMapper.calculatePhotonMaps(10);

    expect(result.globalMap.length).toBeGreaterThan(10);
    expect(result.causticMap.length).toEqual(0);
  });

  test('a photon mapper stores diffuse reflections from photons that have been through at least one specular reflection in a caustic map', () => {
    const w = new World();
    w.lights.push(new PointLight(point(0, 0, 0), new Color(1, 1, 1)));

    const mat = material();
    mat.diffuse = 0.5;
    mat.reflective = 0.5;

    const s = new TransformableSphere();
    s.materialDefinitions = [mat];
    s.material = mat;

    w.objects.push(s);

    const photonMapper = new PhotonMapper(w, 50, 4);
    const result = photonMapper.calculatePhotonMaps(50);

    expect(result.causticMap.length).toBeGreaterThan(0);
  });

  test('the power of a photon reflected from a surface or transmitted through a transparent object will get blended with the color of the material', () => {
    const w = new World();
    w.lights.push(new PointLight(point(0, 0, 0), new Color(1, 0, 0)));

    const mat = material();
    mat.diffuse = 0;
    mat.transparency = 1;
    mat.color = new Color(0, 0, 1);

    const mat2 = material();
    mat2.diffuse = 1;

    const g = new TransformableSphere();
    g.materialDefinitions = [mat, mat2];
    g.material = mat;

    const s = new TransformableSphere();
    s.materialDefinitions = [mat, mat2];
    s.material = mat2;
    s.transform = scaling(2, 2, 2);

    w.objects.push(g, s);

    const photonMapper = new PhotonMapper(w, 50, 4);
    const result = photonMapper.calculatePhotonMaps(50);

    expect(result.causticMap.length).toBeGreaterThan(0);
    expect(result.causticMap[0].power.b).toBeCloseTo(0.5);
  });
});
