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
import { material } from '../../lib/materials';

export class MarbleMadness extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'MarbleMadness',
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
      renderCfg.adaptiveLightSamplingSensitivity,
      this.materials
    );
    lamp.transform = translation(size * 2, size * 2, -size).multiply(
      rotationZ(radians(90))
    );

    world.lights.push(lamp);
    let matIdx = -1;
    const marbles = new Group();
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const xpos = -size / 2 + x;
          const ypos = -size / 2 + y;
          const zpos = -size / 2 + z;

          const mat = material();
          mat.color = new Color(x / size, y / size, z / size);
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
          marbles.add(s);
        }
      }
    }
    marbles.divide(2 * 2 * 2);
    marbles.transform = scaling(0.4, 0.4, 0.4);

    world.objects.push(marbles);

    return world;
  }
}
