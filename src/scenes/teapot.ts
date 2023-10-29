import { AreaLight } from '../lib/lights';
import {
  scaling,
  viewTransform,
  rotationX,
  radians,
  rotationZ,
  translation,
} from '../lib/math/transformations';
import { Color } from '../lib/math/color';
import { World } from '../lib/world';
import { Scene } from './scene';
import { ObjParser } from '../tools/obj-parser';
import teapotLowResObjFile from '../resources/teapot-lowres.obj?raw';
import teapotObjFile from '../resources/teapot.obj?raw';
import { Shape } from '../lib/shapes/shape';
import { Plane } from '../lib/shapes/primitives/plane';
import { CameraConfiguration } from './configuration';
import { RenderConfiguration } from '../renderer/configuration';
import { point, vector } from '../lib/math/vector4';

export class TeaPot implements Scene {
  highRes: boolean;

  cameraCfg: CameraConfiguration = {
    fieldOfView: Math.PI / 3,
    viewTransform: viewTransform(
      point(0, 1.5, -4),
      point(0, 0.6, 0),
      vector(0, 1, 0)
    ),
    aperture: 0.006,
    focalLength: 2,
  };

  constructor(highRes: boolean) {
    this.highRes = highRes;
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
    model.transform = scaling(0.1, 0.1, 0.1).multiply(rotationX(-Math.PI / 2));
    return model;
  }
}
