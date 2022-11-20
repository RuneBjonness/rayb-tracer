import { RenderConfiguration } from '../renderer/configuration';
import { CameraConfiguration } from './configuration';
import { AreaLight, PointLight } from '../lib/lights';
import { multiplyMatrices } from '../lib/matrices';
import { Group } from '../lib/shapes/group';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Shape } from '../lib/shapes/shape';
import { translation, scaling, viewTransform } from '../lib/transformations';
import { point, vector, color, Color } from '../lib/tuples';
import { World } from '../lib/world';
import { Scene } from './scene';

export class Marbles implements Scene {
  cameraCfg: CameraConfiguration = {
    fieldOfView: 1.2,
    viewTransform: viewTransform(
      point(0, 1.3, -5),
      point(0, 1, 0),
      vector(0, 1, 0)
    ),
    aperture: 0.08,
    focalLength: 5,
  };

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = new World();
    world.lights.push(
      renderCfg.enableAreaLights
        ? new AreaLight(
          point(-4, 4, -3),
          vector(2, 0, 0),
          renderCfg.maxAreaLightUvSteps,
          vector(0, 2, 0),
          renderCfg.maxAreaLightUvSteps,
          color(1.5, 1.5, 1.5)
        )
        : new PointLight(point(-3.5, 4.5, -2.5), color(1.5, 1.5, 1.5))
    );

    const lamp = new Sphere();
    lamp.material.color = color(1.5, 1.5, 1.5);
    lamp.material.diffuse = 0;
    lamp.material.specular = 0;
    lamp.material.ambient = 1;
    lamp.transform = multiplyMatrices(
      translation(-5, 6, -3),
      scaling(0.75, 0.75, 0.75)
    );
    world.objects.push(lamp);

    const f = new Plane();
    f.material.specular = 0;
    f.material.ambient = 0.025;
    f.material.diffuse = 0.67;
    f.material.reflective = 0.2;
    world.objects.push(f);

    const sphereColors = [
      color(0.5, 0, 1),
      color(0.6, 0.2, 1),
      color(0.6, 0.3, 1),
      color(0.7, 0.3, 0.9),
      color(0.8, 0.3, 0.9),
      color(0.8, 0.3, 0.8),
      color(0.9, 0.3, 0.8),
      color(1, 0.4, 0.8),
      color(1, 0.5, 0.9),
      color(1, 0.6, 1),
    ];

    const g = new Group();
    g.add(this.glassSphere(color(0.1, 0, 0.2), 0.3, 0.4, 0.7));

    g.add(this.basicSphere(sphereColors[0], -1.2, 0.2, 0.5));
    g.add(this.basicSphere(sphereColors[1], -2.5, 2, 0.75));
    g.add(this.basicSphere(sphereColors[2], 1.9, 6, 0.5));
    g.add(this.basicSphere(sphereColors[4], -0.4, -1.5, 0.3));
    g.add(this.basicSphere(sphereColors[5], -1, 7, 0.5));
    g.add(this.basicSphere(sphereColors[6], 0.3, -1.1, 0.3));
    g.add(this.basicSphere(sphereColors[7], -1.4, -1.5, 0.5));
    g.add(this.basicSphere(sphereColors[8], -1.1, 4, 0.5));
    g.add(this.basicSphere(sphereColors[9], -3, 11, 0.5));

    world.objects.push(g, this.basicSphere(sphereColors[3], 1.3, -2.5, 0.8));

    return world;
  }

  private basicSphere(
    color: Color,
    x: number,
    z: number,
    scale: number
  ): Shape {
    const s = new Sphere();
    s.transform = multiplyMatrices(
      translation(x, scale, z),
      scaling(scale, scale, scale)
    );
    s.material.color = color;
    s.material.diffuse = 0.6;
    s.material.specular = 0;
    s.material.ambient = 0.1;
    s.material.reflective = 0.3;
    return s;
  }

  private glassSphere(
    color: Color,
    x: number,
    z: number,
    scale: number
  ): Shape {
    const s = this.basicSphere(color, x, z, scale);
    s.material.reflective = 0.9;
    s.material.transparancy = 1;
    s.material.refractiveIndex = 1.5;
    s.material.diffuse = 0.9;
    s.material.specular = 0.9;
    s.material.shininess = 200.0;

    return s;
  }
}
