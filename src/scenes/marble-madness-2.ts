import { RenderConfiguration } from '../renderer/configuration';
import { CameraConfiguration } from './configuration';
import { AreaLight } from '../lib/lights';
import { multiplyMatrices } from '../lib/math/matrices';
import { Group } from '../lib/shapes/group';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Shape } from '../lib/shapes/shape';
import {
  translation,
  scaling,
  viewTransform,
  radians,
  rotationZ,
} from '../lib/math/transformations';
import { point, vector, color, Color } from '../lib/math/tuples';
import { World } from '../lib/world';
import { Scene } from './scene';

export class MarbleMadness2 implements Scene {
  cameraCfg: CameraConfiguration = {
    fieldOfView: Math.PI / 3,
    viewTransform: viewTransform(
      point(58, 48, -58),
      point(0, -8, 0),
      vector(0, 1, 0)
    ),
    aperture: 0.005,
    focalLength: 5,
  };

  configureWorld(renderCfg: RenderConfiguration): World {
    const size = 70;
    const world = new World();
    const lamp = new AreaLight(
      color(1.2, 1.2, 1.2),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity
    );
    lamp.transform = multiplyMatrices(
      translation(size * 2, size * 2, -size),
      rotationZ(radians(90))
    );

    world.lights.push(lamp);

    const marbles = new Group();
    for (let x = 0; x < size; x++) {
      const xGroup = new Group();
      for (let y = 0; y < size; y++) {
        const yGroup = new Group();
        for (let z = 0; z < size; z++) {
          const c = color(x / size, y / size, z / size);
          const xpos = -size / 2 + x;
          const ypos = -size / 2 + y;
          const zpos = -size / 2 + z;
          yGroup.add(this.glassSphere(c, xpos, ypos, zpos, 0.33));
        }
        yGroup.divide(10);
        xGroup.add(yGroup);
      }
      marbles.add(xGroup);
    }
    world.objects.push(marbles);

    return world;
  }

  private basicSphere(
    color: Color,
    x: number,
    y: number,
    z: number,
    scale: number
  ): Shape {
    const s = new Sphere();
    s.transform = multiplyMatrices(
      translation(x, y, z),
      scaling(scale, scale, scale)
    );
    s.material.color = color;
    return s;
  }

  private reflectiveSphere(
    color: Color,
    x: number,
    y: number,
    z: number,
    scale: number
  ): Shape {
    const s = this.basicSphere(color, x, y, z, scale);
    s.material.diffuse = 0.8;
    s.material.specular = 0.9;
    s.material.ambient = 0.1;
    s.material.reflective = 0.3;
    return s;
  }

  private glassSphere(
    color: Color,
    x: number,
    y: number,
    z: number,
    scale: number
  ): Shape {
    const s = this.basicSphere(color, x, y, z, scale);
    s.material.reflective = 0.9;
    s.material.transparancy = 1;
    s.material.refractiveIndex = 1.5;
    s.material.diffuse = 0.9;
    s.material.specular = 0.9;
    s.material.shininess = 200.0;
    return s;
  }
}
