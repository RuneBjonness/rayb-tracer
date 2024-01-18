import { RenderConfiguration } from '../../renderer/configuration';
import { AreaLight } from '../../lib/lights';
import { Group } from '../../lib/shapes/group';
import { Sphere } from '../../lib/shapes/primitives/sphere';
import {
  translation,
  scaling,
  radians,
  rotationZ,
} from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { Scene } from '../scene';
import { material } from '../../lib/material/materials';

export class MarbleMadness extends Scene {
  constructor(
    renderCfg: RenderConfiguration,
    private size: 25 | 100,
    private useBvh: boolean
  ) {
    super(
      {
        name: 'MarbleMadness',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: size === 25 ? [40, 30, -40] : [160, 120, -160],
            to: size === 25 ? [0, -3, 0] : [0, -12, 0],
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
    const world = new World();

    const lamp = new AreaLight(
      new Color(1.0, 1.0, 1.0),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity,
      this.materials
    );
    lamp.transform = translation(
      this.size * 2,
      this.size * 2,
      -this.size
    ).multiply(rotationZ(radians(90)));
    world.lights.push(lamp);

    let matIdx = 0;
    const marbles = new Group();
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          const xpos = -this.size / 2 + x;
          const ypos = -this.size / 2 + y;
          const zpos = -this.size / 2 + z;

          const mat = material();
          mat.color = new Color(x / this.size, y / this.size, z / this.size);
          mat.reflective = 0.9;
          mat.transparency = 1;
          mat.refractiveIndex = 1.5;
          this.materials.push(mat);
          matIdx++;

          const s = new Sphere();
          s.transform = translation(xpos, ypos, zpos).multiply(
            scaling(0.33, 0.33, 0.33)
          );
          s.materialDefinitions = this.materials;
          s.materialIdx = matIdx;
          if (this.useBvh) {
            marbles.add(s);
          } else {
            world.objects.push(s);
          }
        }
      }
    }

    if (this.useBvh) {
      marbles.divide(2 * 2 * 2);
      world.objects.push(marbles);
    }

    return world;
  }
}
