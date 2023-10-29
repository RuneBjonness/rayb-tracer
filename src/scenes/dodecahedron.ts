import { RenderConfiguration } from '../renderer/configuration';
import { CameraConfiguration } from './configuration';
import { AreaLight } from '../lib/lights';
import { material, Material } from '../lib/materials';
import { Group } from '../lib/shapes/group';
import { Cylinder } from '../lib/shapes/primitives/cylinder';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Shape } from '../lib/shapes/shape';
import {
  translation,
  scaling,
  viewTransform,
  rotationY,
  radians,
  rotationX,
  rotationZ,
} from '../lib/math/transformations';
import { Color } from '../lib/math/color';
import { World } from '../lib/world';
import { Scene } from './scene';
import { point, vector } from '../lib/math/vector4';

export class Dodecahedron implements Scene {
  cameraCfg: CameraConfiguration = {
    fieldOfView: Math.PI / 3,
    viewTransform: viewTransform(
      point(1, 2.5, -5),
      point(1, 1.8, 1),
      vector(0, 1, 0)
    ),
    aperture: 0.005,
    focalLength: 2.5,
  };

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = new World();
    const lamp = new AreaLight(
      new Color(1.5, 1.5, 1.5),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity
    );
    lamp.transform = translation(-5.5, 2.5, -5).multiply(
      rotationZ(radians(90))
    );

    world.lights.push(lamp);

    const f = new Plane();
    f.material.specular = 0;
    f.material.ambient = 0.025;
    f.material.diffuse = 0.67;
    f.material.reflective = 0.05;
    world.objects.push(f);

    const colors = [
      new Color(1, 0, 0),
      new Color(0.8, 0, 0.6),
      new Color(0.6, 0, 0.6),
      new Color(0.4, 0, 0.6),
      new Color(0, 0.32, 0.83),
      new Color(0.04, 0.7, 0.76),
      new Color(0, 0.6, 0),
      new Color(0.4, 0.8, 0),
      new Color(1, 1, 0),
      new Color(1, 0.8, 0),
      new Color(1, 0.6, 0),
      new Color(1, 0.4, 0),
    ];

    const dodecahedron = new Group();
    const d1 = this.halfDodecahedron(colors.slice(0, 5));
    d1.transform = translation(0, 1.2, 0)
      .multiply(rotationZ(Math.PI))
      .multiply(rotationY(Math.PI / 5));

    const d2 = this.halfDodecahedron(colors.slice(5, 10));

    dodecahedron.add(d1);
    dodecahedron.add(d2);

    dodecahedron.transform = translation(0, 1.2, 3.5)
      .multiply(rotationX(-Math.PI / 6))
      .multiply(rotationY(Math.PI / 6));

    world.objects.push(dodecahedron);

    return world;
  }

  private corner(mat: Material): Shape {
    const s = new Sphere();
    s.transform = translation(0, 0, -1).multiply(scaling(0.2, 0.2, 0.2));
    s.material = mat;
    return s;
  }

  private edge(mat: Material): Shape {
    const cyl = new Cylinder();
    cyl.minimum = 0;
    cyl.maximum = 1;
    cyl.transform = translation(0, 0, -1)
      .multiply(rotationY(-Math.PI / 5))
      .multiply(rotationZ(-Math.PI / 2))
      .multiply(scaling(0.2, 1.2, 0.2));
    cyl.material = mat;
    return cyl;
  }

  private side(mat: Material): Shape {
    const g = new Group();
    g.add(this.corner(mat));
    g.add(this.edge(mat));
    return g;
  }

  private pentagon(mat: Material): Shape {
    const g = new Group();
    for (let i = 0; i < 5; i++) {
      const s = this.side(mat);
      s.transform = rotationY((i * Math.PI) / 2.5);
      g.add(s);
    }
    return g;
  }

  private halfDodecahedron(colors: Color[]): Shape {
    const g = new Group();
    for (let i = 0; i < 5; i++) {
      const mat = material();
      mat.color = colors[i];
      mat.ambient = 0.3;
      const p = this.pentagon(mat);
      p.transform = rotationY((i * Math.PI) / 2.5)
        .multiply(translation(0, 0, 1.2))
        .multiply(rotationX(radians(116.565)));
      g.add(p);
    }
    return g;
  }
}
