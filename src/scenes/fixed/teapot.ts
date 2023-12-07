import { AreaLight } from '../../lib/lights';
import {
  radians,
  rotationZ,
  translation,
} from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { Scene } from '../scene';
import { ObjParser } from '../../tools/obj-parser';
import teapotLowResObjFile from '../../resources/teapot-lowres.obj?raw';
import teapotObjFile from '../../resources/teapot.obj?raw';
import { Shape } from '../../lib/shapes/shape';
import { Plane } from '../../lib/shapes/primitives/plane';
import { RenderConfiguration } from '../../renderer/configuration';

export class TeaPot extends Scene {
  constructor(renderCfg: RenderConfiguration, private highRes: boolean) {
    super(
      {
        name: 'TeaPot',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: [0, 1.5, -4],
            to: [0, 0.6, 0],
            up: [0, 1, 0],
          },
          aperture: 0.006,
          focalDistance: 2,
        },
        world: {},
      },
      renderCfg
    );
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = new World();
    const lamp = new AreaLight(
      new Color(1, 1, 1),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity
    );
    lamp.transform = translation(-3, 4, -2.5).multiply(rotationZ(radians(90)));
    world.lights.push(lamp);

    const f = new Plane();
    f.material.color = new Color(0.3, 0.78, 0.59);
    f.material.specular = 0;
    f.material.ambient = 0.05;
    f.material.diffuse = 0.67;
    f.material.reflective = 0.3;

    world.objects.push(f, this.teapotObj());

    return world;
  }

  private teapotObj(): Shape {
    const parser = new ObjParser();
    parser.currentMaterial.color = new Color(0.3, 0.73, 0.78);
    const model = parser.parse(
      this.highRes ? teapotObjFile : teapotLowResObjFile
    );
    model.transform = model.transform
      .rotateX(-Math.PI / 2)
      .scale(0.1, 0.1, 0.1);
    return model;
  }
}
