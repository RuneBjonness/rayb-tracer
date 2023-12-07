import { RenderConfiguration } from '../../renderer/configuration';
import { AreaLight } from '../../lib/lights';
import { Group } from '../../lib/shapes/group';
import { Sphere } from '../../lib/shapes/primitives/sphere';
import { Shape } from '../../lib/shapes/shape';
import {
  translation,
  scaling,
  radians,
  rotationZ,
} from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { Scene } from '../scene';

export class MarbleMadness2 extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'MarbleMadness2',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: [58, 48, -58],
            to: [0, -8, 0],
            up: [0, 1, 0],
          },
          aperture: 0.005,
          focalDistance: 5,
        },
        world: {},
      },
      renderCfg
    );
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(renderCfg: RenderConfiguration): World {
    const size = 100;
    const world = new World();
    const lamp = new AreaLight(
      new Color(1.2, 1.2, 1.2),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity
    );
    lamp.transform = translation(size * 2, size * 2, -size).multiply(
      rotationZ(radians(90))
    );

    world.lights.push(lamp);

    const marbles = new Group();
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const c = new Color(x / size, y / size, z / size);
          const xpos = -size / 2 + x;
          const ypos = -size / 2 + y;
          const zpos = -size / 2 + z;
          marbles.add(this.glassSphere(c, xpos, ypos, zpos, 0.33));
        }
      }
    }
    marbles.divide(2 * 2 * 2);
    marbles.transform = scaling(0.4, 0.4, 0.4);

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
    s.transform = translation(x, y, z).multiply(scaling(scale, scale, scale));
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
    s.material.transparency = 1;
    s.material.refractiveIndex = 1.5;
    s.material.diffuse = 0.9;
    s.material.specular = 0.9;
    s.material.shininess = 200.0;
    return s;
  }
}
