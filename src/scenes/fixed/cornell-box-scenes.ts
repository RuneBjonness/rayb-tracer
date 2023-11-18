import { RenderConfiguration } from '../../renderer/configuration';
import { AreaLight } from '../../lib/lights';
import { Plane } from '../../lib/shapes/primitives/plane';
import { Sphere } from '../../lib/shapes/primitives/sphere';
import { Shape } from '../../lib/shapes/shape';
import {
  translation,
  scaling,
  radians,
  rotationX,
  rotationY,
} from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { Scene } from '../scene';
import { Cube } from '../../lib/shapes/primitives/cube';
import { Material, material } from '../../lib/materials';
import { CameraConfiguration } from '../scene-definition';

export class CornellBoxTransparency extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'CornellBoxTransparency',
        camera: cornellBoxCameraConfiguration(),
        world: {},
      },
      renderCfg
    );
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = emptyCornellBox(renderCfg);
    world.objects.push(diamondCube(new Color(0.1, 0, 0.2), -1.1, 1.4, 1, 1.8));
    world.objects.push(glassSphere(new Color(0.1, 0, 0.2), 1.4, 0, 1.1));
    return world;
  }
}

export class CornellBoxMatteDiffuse extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'CornellBoxMatteDiffuse',
        camera: cornellBoxCameraConfiguration(),
        world: {},
      },
      renderCfg
    );
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = emptyCornellBox(renderCfg);
    world.objects.push(basicSphere(new Color(1, 1, 1), -2.5, 2.5, 1.1));
    world.objects.push(basicSphere(new Color(0.2, 0.2, 1), 0, 2.5, 1.1));
    world.objects.push(basicSphere(new Color(1, 1, 1), 2.5, 2.5, 1.1));
    return world;
  }
}

function cornellBoxCameraConfiguration(): CameraConfiguration {
  return {
    fieldOfView: 60,
    viewTransform: {
      from: [0, 2.56, -10],
      to: [0, 2.56, 0],
      up: [0, 1, 0],
    },
    aperture: 0.005,
    focalDistance: 2,
  };
}

function emptyCornellBox(renderCfg: RenderConfiguration): World {
  const world = new World();

  const lamp = new AreaLight(
    new Color(1, 1, 1),
    renderCfg.maxLightSamples,
    renderCfg.adaptiveLightSamplingSensitivity
  );
  lamp.transform = translation(0, 5, 0);

  world.lights.push(lamp);
  world.objects.push(lamp);

  const floor = new Plane();
  floor.material = wallMaterial(new Color(1, 1, 1));
  floor.transform = translation(0, -0.001, 0);

  const ceiling = new Plane();
  ceiling.material = wallMaterial(new Color(1, 1, 1));
  ceiling.transform = translation(0, 5, 0);

  const backWall = new Plane();
  backWall.material = wallMaterial(new Color(1, 1, 1));
  backWall.transform = translation(0, 0, 5).multiply(rotationX(radians(90)));

  const leftWall = new Plane();
  leftWall.material = wallMaterial(new Color(1, 0, 0));
  leftWall.transform = translation(-4.55, 0, 0)
    .multiply(rotationY(radians(90)))
    .multiply(rotationX(radians(90)));

  const rightWall = new Plane();
  rightWall.material = wallMaterial(new Color(0, 1, 0));
  rightWall.transform = translation(4.55, 0, 0)
    .multiply(rotationY(radians(90)))
    .multiply(rotationX(radians(90)));

  world.objects.push(floor, ceiling, backWall, leftWall, rightWall);

  return world;
}

function basicSphere(color: Color, x: number, z: number, scale: number): Shape {
  const s = new Sphere();
  s.transform = translation(x, scale, z).multiply(scaling(scale, scale, scale));
  s.material.color = color;
  s.material.diffuse = 0.8;
  s.material.specular = 0.1;
  s.material.shininess = 1;
  s.material.ambient = 0.025;
  return s;
}

function glassSphere(color: Color, x: number, z: number, scale: number): Shape {
  const s = basicSphere(color, x, z, scale);
  s.material.reflective = 0.9;
  s.material.transparency = 1;
  s.material.refractiveIndex = 1.5;
  s.material.diffuse = 0.1;
  s.material.specular = 0.9;
  s.material.shininess = 400.0;

  return s;
}

function basicCube(
  color: Color,
  x: number,
  z: number,
  scale: number,
  height: number
): Shape {
  const s = new Cube();
  s.transform = translation(x, scale * height, z)
    .multiply(scaling(scale, scale * height, scale))
    .multiply(rotationY(radians(30)));
  s.material.color = color;
  s.material.diffuse = 0.8;
  s.material.specular = 0.2;
  s.material.shininess = 1;
  s.material.ambient = 0.025;
  return s;
}

function diamondCube(
  color: Color,
  x: number,
  z: number,
  scale: number,
  height: number
): Shape {
  const s = basicCube(color, x, z, scale, height);
  s.material.reflective = 0.9;
  s.material.transparency = 1;
  s.material.refractiveIndex = 2.5;
  s.material.diffuse = 0.1;
  s.material.specular = 0.9;
  s.material.shininess = 400.0;

  return s;
}

function wallMaterial(c: Color): Material {
  const m = material();
  m.ambient = 0.025;
  m.diffuse = 0.8;
  m.specular = 0.2;
  m.shininess = 1;
  m.reflective = 0;
  m.color = c;
  return m;
}
