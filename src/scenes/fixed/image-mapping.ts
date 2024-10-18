import { PointLight } from '../../lib/lights/lights';
import { TransformableSphere } from '../../lib/shapes/primitives/sphere';
import { radians } from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world/world';
import moonImgMapFile from '../../resources/moon.png';
import { Scene } from '../scene';
import { RenderConfiguration } from '../../renderer/configuration';
import { point } from '../../lib/math/vector4';
import { canvasFromImage } from '../../tools/image-loader';
import { Matrix4 } from '../../lib/math/matrices';
import { material } from '../../lib/material/materials';
import { TextureMap } from '../../lib/material/texture-mapping/texture-map';
import { ImageUvPattern } from '../../lib/material/texture-mapping/uv-patterns';
import { UvMapper } from '../../lib/material/texture-mapping/uv-mappers';

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

    const m = material();
    m.patternIdx = 0;
    m.specular = 0;
    m.ambient = 0.02;

    this.materials.push(m);

    const s = new TransformableSphere();
    s.transform = new Matrix4()
      .rotateY(radians(-130))
      .scale(1.4, 1.4, 1.4)
      .translate(0, 1, 0);
    s.materialDefinitions = this.materials;
    s.materialIdx = 0;
    s.patternDefinitions = [
      new TextureMap(new ImageUvPattern(img.pixels), UvMapper.Spherical),
    ];

    world.objects.push(s);
    this.world = world;

    return world;
  }
}
