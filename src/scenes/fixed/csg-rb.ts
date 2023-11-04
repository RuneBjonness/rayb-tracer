import { AreaLight } from '../../lib/lights';
import { Material, material } from '../../lib/materials';
import { CsgShape } from '../../lib/shapes/csg-shape';
import { Group } from '../../lib/shapes/group';
import { Cube } from '../../lib/shapes/primitives/cube';
import { Cylinder } from '../../lib/shapes/primitives/cylinder';
import { Plane } from '../../lib/shapes/primitives/plane';
import { Shape } from '../../lib/shapes/shape';
import {
  translation,
  scaling,
  rotationY,
  shearing,
  radians,
} from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { Scene } from '../scene';
import { RenderConfiguration } from '../../renderer/configuration';

export class CsgRb extends Scene {
  private baseMaterial: Material;

  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'CsgRb',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: [0, 6.2, -1.75],
            to: [0, 0, 0],
            up: [0, 1, 0],
          },
          aperture: 0.005,
          focalDistance: 2,
        },
      },
      renderCfg
    );
    this.baseMaterial = material();
    this.baseMaterial.color = new Color(0.66, 0.35, 0.85);
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = new World();
    const lamp = new AreaLight(
      new Color(1.5, 1.5, 1.5),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity
    );
    lamp.transform = translation(-2, 2.5, -2.5);

    world.lights.push(lamp);

    const f = new Plane();
    f.material.specular = 0;
    f.material.ambient = 0.025;
    f.material.diffuse = 0.67;
    f.material.color = new Color(0.2, 0, 0.8);
    world.objects.push(f);

    const rbt = new Group();
    const cR = this.letterCaptialR();
    let xOffset = -9.4;
    cR.transform = translation(xOffset, 0, 0);
    const a = this.letterA();
    xOffset += 2;
    a.transform = translation(xOffset, 0, 0);
    const y = this.letterY();
    xOffset += 2;
    y.transform = translation(xOffset, 0, 0);
    const cB = this.letterCaptialB();
    xOffset += 2;
    cB.transform = translation(xOffset, 0, 0);
    const cT = this.letterCaptialT();
    xOffset += 3;
    cT.transform = translation(xOffset, 0, 0);
    const r = this.letterR();
    xOffset += 1.5;
    r.transform = translation(xOffset, 0, 0);
    const a2 = this.letterA();
    xOffset += 2;
    a2.transform = translation(xOffset, 0, 0);
    const c = this.letterC();
    xOffset += 2.2;
    c.transform = translation(xOffset, 0, 0);
    const e = this.letterE();
    xOffset += 2;
    e.transform = translation(xOffset, 0, 0);
    const r2 = this.letterR();
    xOffset += 2;
    r2.transform = translation(xOffset, 0, 0);

    rbt.add(cR);
    rbt.add(a);
    rbt.add(y);
    rbt.add(cB);
    rbt.add(cT);
    rbt.add(r);
    rbt.add(a2);
    rbt.add(c);
    rbt.add(e);
    rbt.add(r2);

    rbt.transform = translation(0, 0.25, 1);
    rbt.divide(4);

    world.objects.push(rbt);

    return world;
  }

  private circle(): Shape {
    const outerCylinder = new Cylinder();
    outerCylinder.minimum = 0;
    outerCylinder.maximum = 0.25;
    outerCylinder.closed = true;
    outerCylinder.material = this.baseMaterial;

    const innerCylinder = new Cylinder();
    innerCylinder.minimum = 0;
    innerCylinder.maximum = 0.3;
    innerCylinder.closed = true;
    innerCylinder.transform = scaling(0.5, 1, 0.5);
    innerCylinder.material = this.baseMaterial;

    return new CsgShape('difference', outerCylinder, innerCylinder);
  }

  private halfCircle(): Shape {
    const cube = new Cube();
    cube.transform = translation(-1, 0, 0);

    return new CsgShape('difference', this.circle(), cube);
  }

  private letterCaptialP(): Shape {
    const leftLeg = new Cube();
    leftLeg.material = this.baseMaterial;
    leftLeg.transform = translation(-0.25, 0.125, -1).multiply(
      scaling(0.25, 0.125, 2)
    );

    return new CsgShape('union', leftLeg, this.halfCircle());
  }

  private letterCaptialR(): Shape {
    const rightLeg = new Cube();
    rightLeg.material = this.baseMaterial;
    rightLeg.transform = translation(0.5, 0.125, -1.9)
      .multiply(scaling(0.25, 0.125, 1.1))
      .multiply(shearing(0, -1, 0, 0, 0, 0));

    return new CsgShape('union', rightLeg, this.letterCaptialP());
  }

  private letterCaptialB(): Shape {
    const lowerHalfCircle = this.halfCircle();
    lowerHalfCircle.material = this.baseMaterial;
    lowerHalfCircle.transform = translation(0, 0, -1.8).multiply(
      scaling(1.3, 1, 1.2)
    );

    return new CsgShape('union', lowerHalfCircle, this.letterCaptialP());
  }

  private letterCaptialT(): Shape {
    const leg = new Cube();
    leg.material = this.baseMaterial;
    leg.transform = translation(0, 0.125, -1).multiply(scaling(0.25, 0.125, 2));

    const top = new Cube();
    top.material = this.baseMaterial;
    top.transform = translation(0, 0.125, 0.75).multiply(
      scaling(1, 0.125, 0.25)
    );

    return new CsgShape('union', leg, top);
  }

  private letterA(): Shape {
    const c = this.circle();
    c.transform = translation(0, 0, -2);

    const leg = new Cube();
    leg.material = this.baseMaterial;
    leg.transform = translation(0.75, 0.125, -2).multiply(
      scaling(0.25, 0.125, 1)
    );
    return new CsgShape('union', c, leg);
  }

  private letterC(): Shape {
    const c = this.circle();
    c.transform = translation(0, 0, -2);

    const cube = new Cube();
    cube.material = this.baseMaterial;
    cube.transform = translation(1.5, 0, -2).multiply(rotationY(radians(45)));
    return new CsgShape('difference', c, cube);
  }

  private letterE(): Shape {
    const body = this.circle();
    body.transform = translation(0, 0, -2);

    const cube = new Cube();
    cube.material = this.baseMaterial;
    cube.transform = translation(0.7, 0, -2.2).multiply(scaling(1, 1, 0.25));
    const openBody = new CsgShape('difference', body, cube);

    const bar = new Cube();
    bar.material = this.baseMaterial;
    bar.transform = translation(0.25, 0.125, -2).multiply(
      scaling(0.75, 0.125, 0.25)
    );
    return new CsgShape('union', openBody, bar);
  }

  private letterR(): Shape {
    const c = this.circle();
    c.transform = translation(0.1, 0, -2);
    const cube = new Cube();
    cube.material = this.baseMaterial;
    cube.transform = translation(0, 0, -0.8).multiply(rotationY(radians(45)));
    const top = new CsgShape('intersection', c, cube);

    const leg = new Cube();
    leg.material = this.baseMaterial;
    leg.transform = translation(-0.5, 0.125, -2).multiply(
      scaling(0.25, 0.125, 1)
    );
    return new CsgShape('union', top, leg);
  }

  private letterY(): Shape {
    const shortLeg = new Cube();
    shortLeg.material = this.baseMaterial;
    shortLeg.transform = translation(-0.12, 0.125, -2)
      .multiply(scaling(0.25, 0.125, 1))
      .multiply(shearing(0, -2, 0, 0, 0, 0));

    const longLeg = new Cube();
    longLeg.material = this.baseMaterial;
    longLeg.transform = translation(0.5, 0.125, -2.6)
      .multiply(scaling(0.25, 0.125, 1.6))
      .multiply(shearing(0, 2, 0, 0, 0, 0));

    return new CsgShape('union', shortLeg, longLeg);
  }
}
