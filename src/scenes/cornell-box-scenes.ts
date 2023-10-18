import { RenderConfiguration } from '../renderer/configuration';
import { CameraConfiguration } from './configuration';
import { AreaLight } from '../lib/lights';
import { multiplyMatrices } from '../lib/math/matrices';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Shape } from '../lib/shapes/shape';
import {
  translation,
  scaling,
  viewTransform,
  radians,
  rotationX,
  rotationY,
} from '../lib/math/transformations';
import { color, Color } from '../lib/math/tuples';
import { World } from '../lib/world';
import { Scene } from './scene';
import { Cube } from '../lib/shapes/primitives/cube';
import { Material, material } from '../lib/materials';
import { point, vector } from '../lib/math/vector4';

export class CornellBoxTransparency implements Scene {
  cameraCfg = cornellBoxCameraConfiguration();

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = emptyCornellBox(renderCfg);
    world.objects.push(diamondCube(color(0.1, 0, 0.2), -1.1, 1.4, 1, 1.8));
    world.objects.push(glassSphere(color(0.1, 0, 0.2), 1.4, 0, 1.1));
    return world;
  }
}

export class CornellBoxMatteDiffuse implements Scene {
  cameraCfg = cornellBoxCameraConfiguration();

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = emptyCornellBox(renderCfg);
    world.objects.push(basicSphere(color(1, 1, 1), -2.5, 2.5, 1.1));
    world.objects.push(basicSphere(color(0.2, 0.2, 1), 0, 2.5, 1.1));
    world.objects.push(basicSphere(color(1, 1, 1), 2.5, 2.5, 1.1));
    return world;
  }
}

function cornellBoxCameraConfiguration(): CameraConfiguration {
  return {
    fieldOfView: Math.PI / 3,
    viewTransform: viewTransform(
      point(0, 2.56, -10),
      point(0, 2.56, 0),
      vector(0, 1, 0)
    ),
    aperture: 0.005,
    focalLength: 2,
  };
}

function emptyCornellBox(renderCfg: RenderConfiguration): World {
  const world = new World();

  const lamp = new AreaLight(
    color(1, 1, 1),
    renderCfg.maxLightSamples,
    renderCfg.adaptiveLightSamplingSensitivity
  );
  lamp.transform = translation(0, 5, 0);

  world.lights.push(lamp);
  world.objects.push(lamp);

  const floor = new Plane();
  floor.material = wallMaterial(color(1, 1, 1));
  floor.transform = translation(0, -0.001, 0);

  const ceiling = new Plane();
  ceiling.material = wallMaterial(color(1, 1, 1));
  ceiling.transform = translation(0, 5, 0);

  const backWall = new Plane();
  backWall.material = wallMaterial(color(1, 1, 1));
  backWall.transform = multiplyMatrices(
    translation(0, 0, 5),
    rotationX(radians(90))
  );

  const leftWall = new Plane();
  leftWall.material = wallMaterial(color(1, 0, 0));
  leftWall.transform = multiplyMatrices(
    translation(-4.55, 0, 0),
    multiplyMatrices(rotationY(radians(90)), rotationX(radians(90)))
  );

  const rightWall = new Plane();
  rightWall.material = wallMaterial(color(0, 1, 0));
  rightWall.transform = multiplyMatrices(
    translation(4.55, 0, 0),
    multiplyMatrices(rotationY(radians(90)), rotationX(radians(90)))
  );

  world.objects.push(floor, ceiling, backWall, leftWall, rightWall);

  return world;
}

function basicSphere(color: Color, x: number, z: number, scale: number): Shape {
  const s = new Sphere();
  s.transform = multiplyMatrices(
    translation(x, scale, z),
    scaling(scale, scale, scale)
  );
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
  s.material.transparancy = 1;
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
  s.transform = multiplyMatrices(
    translation(x, scale * height, z),
    multiplyMatrices(
      scaling(scale, scale * height, scale),
      rotationY(radians(30))
    )
  );
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
  s.material.transparancy = 1;
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
