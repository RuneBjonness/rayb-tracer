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
import teapotObjFile from '../../resources/teapot.obj?raw';
import { Shape } from '../../lib/shapes/shape';
import { Plane } from '../../lib/shapes/primitives/plane';
import { RenderConfiguration } from '../../renderer/configuration';
import { material } from '../../lib/material/materials';

export class TeaPot extends Scene {
  constructor(renderCfg: RenderConfiguration) {
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
      renderCfg.adaptiveLightSamplingSensitivity,
      this.materials
    );
    lamp.transform = translation(-3, 4, -2.5).multiply(rotationZ(radians(90)));
    world.lights.push(lamp);

    const floorMaterial = material();
    floorMaterial.color = new Color(0.3, 0.78, 0.59);
    floorMaterial.specular = 0;
    floorMaterial.ambient = 0.05;
    floorMaterial.diffuse = 0.67;
    floorMaterial.reflective = 0.3;
    this.materials.push(floorMaterial);

    const f = new Plane();
    f.materialDefinitions = this.materials;
    f.material = floorMaterial;

    world.objects.push(f, this.teapotObj());

    return world;
  }

  private teapotObj(): Shape {
    const mat = material();
    mat.color = new Color(0.3, 0.73, 0.78);
    this.materials.push(mat);

    const parser = new ObjParser();
    parser.materialDefinitions = this.materials;
    parser.currentMaterial = mat;
    const model = parser.parse(teapotObjFile);
    model.transform = model.transform
      .rotateX(-Math.PI / 2)
      .scale(0.1, 0.1, 0.1);
    return model;
  }
}
