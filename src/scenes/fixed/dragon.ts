import { AreaLight } from '../../lib/lights';
import {
  radians,
  rotationZ,
  translation,
} from '../../lib/math/transformations';
import { Color, colorFromHex } from '../../lib/math/color';
import { World } from '../../lib/world';
import { Scene } from '../scene';
import { ObjParser } from '../../tools/obj-parser';
import dragonObjFile from '../../resources/dragon.obj?raw';
import { Shape } from '../../lib/shapes/shape';
import { Plane } from '../../lib/shapes/primitives/plane';
import { RenderConfiguration } from '../../renderer/configuration';

export class Dragon extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'Chinese Dragon',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: [1, 1.75, -6],
            to: [1, 0.75, 0],
            up: [0, 1, 0],
          },
          aperture: 0.005,
          focalDistance: 3,
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
    f.material.color = colorFromHex('#9B0000');
    f.material.specular = 0;
    f.material.ambient = 0.05;
    f.material.diffuse = 0.67;
    f.material.reflective = 0.15;

    world.objects.push(f, this.dragonObj());

    return world;
  }

  private dragonObj(): Shape {
    const parser = new ObjParser();
    parser.currentMaterial.color = colorFromHex('#FFD700');
    parser.currentMaterial.ambient = 0.05;
    parser.currentMaterial.specular = 0.1;
    parser.currentMaterial.diffuse = 0.6;
    parser.currentMaterial.reflective = 0.8;
    const model = parser.parse(dragonObjFile);
    model.transform = model.transform
      .rotateY(radians(-150))
      .scale(0.4, 0.4, 0.4);
    return model;
  }
}
