import { RenderConfiguration } from '../renderer/configuration';
import { CameraConfiguration } from './configuration';
import { AreaLight } from '../lib/lights';
import { multiplyMatrices } from '../lib/math/matrices';
import {
  TextureMap,
  CubeMap,
} from '../lib/patterns/texture-mapping/texture-map';
import {
  PlanarMapper,
  SphericalMapper,
  CylindricalMapper,
} from '../lib/patterns/texture-mapping/uv-mappers';
import { CheckersUvPattern } from '../lib/patterns/texture-mapping/uv-patterns';
import { Cube } from '../lib/shapes/primitives/cube';
import { Cylinder } from '../lib/shapes/primitives/cylinder';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import {
  translation,
  scaling,
  viewTransform,
  rotationY,
  radians,
  rotationZ,
} from '../lib/math/transformations';
import { color } from '../lib/math/tuples';
import { World } from '../lib/world';
import { Scene } from './scene';
import { point, vector } from '../lib/math/vector4';

export class TextureMapping implements Scene {
  cameraCfg: CameraConfiguration = {
    fieldOfView: Math.PI / 3,
    viewTransform: viewTransform(
      point(0, 1.75, -5),
      point(0, 1.25, 0),
      vector(0, 1, 0)
    ),
    aperture: 0.005,
    focalLength: 2.5,
  };

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = new World();
    const lamp = new AreaLight(
      color(1.5, 1.5, 1.5),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity
    );
    lamp.transform = multiplyMatrices(
      translation(-4, 5, -4),
      multiplyMatrices(rotationY(radians(-45)), rotationZ(radians(90)))
    );
    world.lights.push(lamp);
    world.objects.push(lamp);

    const f = new Plane();
    f.material.pattern = new TextureMap(
      new CheckersUvPattern(
        2,
        2,
        color(0.83, 0.9, 0.95),
        color(0.1, 0.32, 0.46)
      ),
      new PlanarMapper()
    );
    f.material.pattern.transform = multiplyMatrices(
      translation(0, 0.5, 0),
      rotationY(radians(-45))
    );

    const s = new Sphere();
    s.transform = translation(0, 1, 0);
    s.material.pattern = new TextureMap(
      new CheckersUvPattern(
        16,
        8,
        color(1, 0.98, 0.91),
        color(0.95, 0.77, 0.06)
      ),
      new SphericalMapper()
    );
    s.material.diffuse = 0.6;
    s.material.specular = 0;
    s.material.ambient = 0.1;
    s.material.reflective = 0.3;

    const cyl = new Cylinder();
    cyl.minimum = 0;
    cyl.maximum = 0.625;
    cyl.transform = multiplyMatrices(
      translation(-1.75, 0, 2.5),
      scaling(1.25, 1.25 * 3.1415, 1.25)
    );
    cyl.material.pattern = new TextureMap(
      new CheckersUvPattern(
        16,
        8,
        color(0.91, 0.96, 0.95),
        color(0.08, 0.56, 0.47)
      ),
      new CylindricalMapper()
    );
    cyl.material.diffuse = 0.6;
    cyl.material.specular = 0;
    cyl.material.ambient = 0.1;
    cyl.material.reflective = 0.3;

    const cubeSidePattern = new CheckersUvPattern(
      5,
      5,
      color(0.98, 0.86, 0.95),
      color(0.68, 0.06, 0.57)
    );

    const cubeMap = new CubeMap([
      cubeSidePattern,
      cubeSidePattern,
      cubeSidePattern,
      cubeSidePattern,
      cubeSidePattern,
      cubeSidePattern,
    ]);

    const cube = new Cube();
    cube.transform = multiplyMatrices(
      translation(1.75, 1.25, 2.8),
      multiplyMatrices(rotationY(radians(45)), scaling(1.25, 1.25, 1.25))
    );
    cube.material.pattern = cubeMap;
    cube.material.diffuse = 0.6;
    cube.material.specular = 0;
    cube.material.ambient = 0.1;
    cube.material.reflective = 0.3;

    world.objects.push(f, s, cyl, cube);

    return world;
  }
}
