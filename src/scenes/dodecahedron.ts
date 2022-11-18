import { CameraConfiguration, RenderConfiguration } from '../lib/configuration';
import { AreaLight, PointLight } from '../lib/lights';
import { material, Material } from '../lib/materials';
import { multiplyMatrices } from '../lib/matrices';
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
} from '../lib/transformations';
import { point, vector, color, Color } from '../lib/tuples';
import { World } from '../lib/world';
import { Scene } from './scene';

export class Dodecahedron implements Scene {
  cameraCfg: CameraConfiguration = {
    fieldOfView: Math.PI / 3,
    viewTransform: viewTransform(
      point(0, 1.5, -5),
      point(0, 1, 0),
      vector(0, 1, 0)
    ),
    aperture: 0.005,
    focalLength: 2.5,
  };

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = new World();
    world.lights.push(
      renderCfg.enableAreaLights
        ? new AreaLight(
            point(-5.5, 3.5, -5),
            vector(3, 0, 0),
            renderCfg.maxAreaLightUvSteps,
            vector(0, 3, 0),
            renderCfg.maxAreaLightUvSteps,
            color(1.5, 1.5, 1.5)
          )
        : new PointLight(point(-5.5, 3.5, -5), color(1.5, 1.5, 1.5))
    );

    const lamp = new Sphere();
    lamp.material.color = color(1.5, 1.5, 1.5);
    lamp.material.diffuse = 0;
    lamp.material.specular = 0;
    lamp.material.ambient = 1;
    lamp.transform = multiplyMatrices(
      translation(-4, 5, -3),
      scaling(0.75, 0.75, 0.75)
    );
    world.objects.push(lamp);

    const f = new Plane();
    f.material.specular = 0;
    f.material.ambient = 0.025;
    f.material.diffuse = 0.67;
    f.material.reflective = 0.2;
    world.objects.push(f);

    const colors = [
      color(1, 0, 0),
      color(0.8, 0, 0.6),
      color(0.6, 0, 0.6),
      color(0.4, 0, 0.6),
      color(0, 0.32, 0.83),
      color(0.04, 0.7, 0.76),
      color(0, 0.6, 0),
      color(0.4, 0.8, 0),
      color(1, 1, 0),
      color(1, 0.8, 0),
      color(1, 0.6, 0),
      color(1, 0.4, 0),
    ];

    const dodecahedron = new Group();
    const d1 = this.halfDodecahedron(colors.slice(0, 5));
    d1.transform = multiplyMatrices(
      translation(0, 1.2, 0),
      multiplyMatrices(rotationZ(Math.PI), rotationY(Math.PI / 5))
    );

    const d2 = this.halfDodecahedron(colors.slice(5, 10));

    dodecahedron.add(d1);
    dodecahedron.add(d2);

    dodecahedron.transform = multiplyMatrices(
      translation(0, 1, 1.5),
      multiplyMatrices(rotationX(-Math.PI / 6), rotationY(Math.PI / 6))
    );

    world.objects.push(dodecahedron);

    return world;
  }

  private corner(mat: Material): Shape {
    const s = new Sphere();
    s.transform = multiplyMatrices(
      translation(0, 0, -1),
      scaling(0.2, 0.2, 0.2)
    );
    s.material = mat;
    return s;
  }

  private edge(mat: Material): Shape {
    const cyl = new Cylinder();
    cyl.minimum = 0;
    cyl.maximum = 1;
    cyl.transform = multiplyMatrices(
      translation(0, 0, -1),
      multiplyMatrices(
        rotationY(-Math.PI / 5),
        multiplyMatrices(rotationZ(-Math.PI / 2), scaling(0.2, 1.2, 0.2))
      )
    );
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
      p.transform = multiplyMatrices(
        rotationY((i * Math.PI) / 2.5),
        multiplyMatrices(translation(0, 0, 1.2), rotationX(radians(116.565)))
      );
      g.add(p);
    }
    return g;
  }
}
