import { PointLight } from '../../lib/lights';
import { Sphere } from '../../lib/shapes/primitives/sphere';
import { radians } from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { SphericalMapper } from '../../lib/patterns/texture-mapping/uv-mappers';
import moonImgMapFile from '../../resources/moon.png';
import { Scene } from '../scene';
import { TextureMap } from '../../lib/patterns/texture-mapping/texture-map';
import { ImageUvPattern } from '../../lib/patterns/texture-mapping/uv-patterns';
import { RenderConfiguration } from '../../renderer/configuration';
import { point } from '../../lib/math/vector4';
import { canvasFromImage } from '../../tools/image-loader';
import { Matrix4 } from '../../lib/math/matrices';

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
          focalDistance: 3.5,
        },
        world: {},
      },
      renderCfg
    );
  }

  async configureWorld(_renderCfg: RenderConfiguration): Promise<World> {
    const world = new World();
    world.lights.push(
      new PointLight(point(-2.4, 3.5, -2.4), new Color(0.9, 0.9, 0.9))
    );

    const img = await canvasFromImage(moonImgMapFile);

    const s = new Sphere();
    s.transform = new Matrix4()
      .rotateY(radians(-130))
      .scale(1.4, 1.4, 1.4)
      .translate(0, 1, 0);
    s.material.pattern = new TextureMap(
      new ImageUvPattern(img.pixels),
      new SphericalMapper()
    );
    s.material.specular = 0;
    s.material.ambient = 0.02;

    world.objects.push(s);
    this.world = world;

    return world;
  }
}
