import { PointLight } from '../../lib/lights';
import { Sphere } from '../../lib/shapes/primitives/sphere';
import { translation, scaling } from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { SphericalMapper } from '../../lib/patterns/texture-mapping/uv-mappers';
import moonImgMapFile from '../../resources/moon.ppm?raw';
import { parsePPM } from '../../tools/ppm-parser';
import { Scene } from '../scene';
import { TextureMap } from '../../lib/patterns/texture-mapping/texture-map';
import { ImageUvPattern } from '../../lib/patterns/texture-mapping/uv-patterns';
import { RenderConfiguration } from '../../renderer/configuration';
import { point } from '../../lib/math/vector4';

export class ImageMapping extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'ImageMapping',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: [0, 1.5, -5],
            to: [0, 1, 0],
            up: [0, 1, 0],
          },
          aperture: 0.005,
          focalDistance: 2,
        },
        world: {},
      },
      renderCfg
    );
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(_renderCfg: RenderConfiguration): World {
    const world = new World();
    world.lights.push(
      new PointLight(point(-2.4, 3.5, -2.4), new Color(0.9, 0.9, 0.9))
    );

    const img = parsePPM(moonImgMapFile);

    const s = new Sphere();
    s.transform = translation(0, 1, 0).multiply(scaling(1.4, 1.4, 1.4));
    s.material.pattern = new TextureMap(
      new ImageUvPattern(img.pixels),
      new SphericalMapper()
    );
    s.material.specular = 0;
    s.material.ambient = 0.02;

    world.objects.push(s);

    return world;
  }
}
