import { Color } from '../lib/math/color';
import {
  radians,
  rotationX,
  rotationY,
  rotationZ,
  scaling,
  translation,
  viewTransform,
} from '../lib/math/transformations';
import { Shape } from '../lib/shapes/shape';
import { AreaLight } from '../lib/lights';
import { World } from '../lib/world';
import {
  BlendedPatterns,
  Checkers3dPattern,
  RadialGradientPattern,
  RingPattern,
  StripePattern,
} from '../lib/patterns/patterns';
import { material } from '../lib/materials';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Scene } from './scene';
import { Group } from '../lib/shapes/group';
import { CameraConfiguration } from './configuration';
import { RenderConfiguration } from '../renderer/configuration';
import { point, vector } from '../lib/math/vector4';

export class Patterns implements Scene {
  cameraCfg: CameraConfiguration = {
    fieldOfView: Math.PI / 3,
    viewTransform: viewTransform(
      point(0, 1.6, -5),
      point(0, 1, 0),
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
    lamp.transform = translation(-5, 4, -4).multiply(rotationZ(radians(90)));
    world.lights.push(lamp);

    world.objects.push(
      ...this.checkeredRoom(new Color(0.9, 1, 0.9), new Color(0.1, 0.4, 0.1))
    );

    const left = new Sphere();
    left.transform = translation(-1.3, 0.5, 0.1).multiply(
      scaling(0.5, 0.5, 0.5)
    );
    left.material.pattern = new RingPattern(
      new Color(0, 0.5, 0.5),
      new Color(0.2, 0.9, 0.9)
    );
    left.material.pattern.transform = scaling(0.15, 0.15, 0.15)
      .multiply(rotationY(radians(30)))
      .multiply(rotationX(radians(105)));
    left.material.shininess = 50;
    left.material.diffuse = 0.9;
    left.material.specular = 0.2;

    const middle = new Sphere();
    middle.transform = translation(0.7, 1, 1.0);
    middle.material.color = new Color(0.2, 0.2, 0.2);
    middle.material.reflective = 0.9;
    middle.material.specular = 1;
    middle.material.shininess = 400;

    const leftSmall = new Sphere();
    leftSmall.transform = translation(-1.4, 0.25, -1).multiply(
      scaling(0.25, 0.25, 0.25)
    );
    const rotatedStripesA = new StripePattern(
      new Color(0.1, 0.5, 1),
      new Color(0.4, 0.7, 1)
    );
    rotatedStripesA.transform = scaling(0.25, 0.25, 0.25).multiply(
      rotationZ(radians(45))
    );
    const rotatedStripesB = new StripePattern(
      new Color(0.1, 0.5, 1),
      new Color(0.4, 0.7, 1)
    );
    rotatedStripesB.transform = scaling(0.25, 0.25, 0.25).multiply(
      rotationZ(radians(-45))
    );
    leftSmall.material.pattern = new BlendedPatterns(
      rotatedStripesA,
      rotatedStripesB
    );
    leftSmall.material.specular = 0.2;
    leftSmall.material.shininess = 100;

    const front = new Sphere();
    front.transform = translation(-0.3, 0.5, -1.2).multiply(
      scaling(0.5, 0.5, 0.5)
    );
    front.material.color = new Color(0, 0, 0.3);
    front.material.reflective = 0.9;
    front.material.transparancy = 1;
    front.material.refractiveIndex = 1.5;

    const middleBehind = new Sphere();
    middleBehind.transform = translation(-1.2, 0.75, 2.5).multiply(
      scaling(0.75, 0.75, 0.75)
    );
    middleBehind.material.pattern = new Checkers3dPattern(
      new Color(0.1, 0.4, 0.3),
      new Color(0.7, 0.9, 0.8)
    );
    middleBehind.material.pattern.transform = scaling(0.5, 0.5, 0.5).multiply(
      rotationY(radians(30))
    );

    const right = new Sphere();
    right.transform = translation(1.5, 0.5, -0.5).multiply(
      scaling(0.5, 0.5, 0.5)
    );
    right.material.pattern = new RadialGradientPattern(
      new Color(1, 1, 0),
      new Color(0, 1, 0)
    );
    right.material.pattern.transform = scaling(0.2, 0.2, 0.2)
      .multiply(rotationY(radians(-10)))
      .multiply(rotationX(radians(80)));
    right.material.diffuse = 0.7;
    right.material.specular = 0.3;

    const spheres = new Group();
    spheres.add(leftSmall);
    spheres.add(left);
    spheres.add(front);
    spheres.add(middle);
    spheres.add(middleBehind);
    spheres.add(right);
    spheres.divide(2);

    world.objects.push(spheres);

    return world;
  }

  private checkeredRoom(c1: Color, c2: Color): Shape[] {
    const floor = new Plane();
    floor.material.pattern = new Checkers3dPattern(c1, c2);
    floor.material.pattern.transform = translation(0, 0.5, 0).multiply(
      rotationY(radians(-45))
    );
    floor.material.specular = 0.8;
    floor.material.reflective = 0.3;

    const ceiling = new Plane();
    ceiling.transform = translation(0, 5, 0);
    ceiling.material.color = c1;
    ceiling.material.ambient = 0.5;
    ceiling.material.specular = 0.8;
    ceiling.material.reflective = 0;

    const wallMaterial = material();
    wallMaterial.pattern = new StripePattern(c1, c2);
    wallMaterial.reflective = 0.1;

    const leftWall = new Plane();
    leftWall.transform = translation(0, 0, 10)
      .multiply(rotationY(radians(-45)))
      .multiply(rotationX(radians(90)));
    leftWall.material = wallMaterial;

    const leftHiddenWall = new Plane();
    leftHiddenWall.transform = translation(0, 0, -10)
      .multiply(rotationY(radians(45)))
      .multiply(rotationX(radians(90)));
    leftHiddenWall.material = wallMaterial;

    const rightWall = new Plane();
    rightWall.transform = translation(0, 0, 10)
      .multiply(rotationY(radians(45)))
      .multiply(rotationX(radians(90)));
    rightWall.material = wallMaterial;

    const rightHiddenWall = new Plane();
    rightHiddenWall.transform = translation(0, 0, -10)
      .multiply(rotationY(radians(-45)))
      .multiply(rotationX(radians(90)));
    rightHiddenWall.material = wallMaterial;

    return [
      floor,
      ceiling,
      leftWall,
      leftHiddenWall,
      rightWall,
      rightHiddenWall,
    ];
  }
}
