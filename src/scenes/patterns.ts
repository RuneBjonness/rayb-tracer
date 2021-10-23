import { point, vector, color, Color } from '../lib/tuples';
import {
    radians,
    rotationX,
    rotationY,
    scaling,
    translation,
    viewTransform,
} from '../lib/transformations';
import { multiply } from '../lib/matrices';
import { Shape } from '../lib/shapes/shape';
import { AreaLight } from '../lib/lights';
import { World } from '../lib/world';
import {
    Checkers3dPattern,
    RadialGradientPattern,
    RingPattern,
    StripePattern,
} from '../lib/patterns/patterns';
import { material } from '../lib/materials';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { CamerConfiguration, Scene } from './Scene';

export class Patterns implements Scene {
    cameraCfg: CamerConfiguration = {
        fieldOfView: Math.PI / 3,
        viewTransform: viewTransform(
            point(0, 1.5, -5),
            point(0, 1, 0),
            vector(0, 1, 0)
        ),
        aperture: 0.005,
        focalLength: 2.5,
        focalSamplingRate: 2,
    };

    configureWorld(): World {
        const world = new World();
        world.lights.push(
            new AreaLight(
                point(-5.5, 3.5, -5),
                vector(3, 0, 0),
                8,
                vector(0, 3, 0),
                8,
                color(1.5, 1.5, 1.5)
            )
        );

        world.objects.push(
            ...this.checkeredRoom(color(0.9, 1, 0.9), color(0.1, 0.4, 0.1))
        );

        const left = new Sphere();
        left.transform = multiply(
            translation(-1.3, 0.5, 0.1),
            scaling(0.5, 0.5, 0.5)
        );
        left.material.pattern = new RingPattern(
            color(0.1, 0.5, 1),
            color(0.4, 0.7, 1)
        );
        left.material.pattern.transform = multiply(
            scaling(0.15, 0.15, 0.15),
            multiply(rotationY(radians(30)), rotationX(radians(105)))
        );
        left.material.diffuse = 0.7;
        left.material.specular = 0.3;

        const middle = new Sphere();
        middle.transform = translation(0.7, 1, 1.0);
        middle.material.color = color(0.2, 0.2, 0.2);
        middle.material.reflective = 0.9;
        middle.material.specular = 1;
        middle.material.shininess = 400;

        const leftSmall = new Sphere();
        leftSmall.transform = multiply(
            translation(-1.4, 0.25, -1),
            scaling(0.25, 0.25, 0.25)
        );
        leftSmall.material.color = color(0, 0.2, 0);
        leftSmall.material.reflective = 0.3;
        leftSmall.material.specular = 0.6;
        leftSmall.material.shininess = 100;

        const front = new Sphere();
        front.transform = multiply(
            translation(-0.3, 0.5, -1.2),
            scaling(0.5, 0.5, 0.5)
        );
        front.material.color = color(0, 0, 0.3);
        front.material.reflective = 0.9;
        front.material.transparancy = 1;
        front.material.refractiveIndex = 1.5;

        const middleBehind = new Sphere();
        middleBehind.transform = multiply(
            translation(-1.2, 0.75, 2.5),
            scaling(0.75, 0.75, 0.75)
        );
        middleBehind.material = front.material;

        const right = new Sphere();
        right.transform = multiply(
            translation(1.5, 0.5, -0.5),
            scaling(0.5, 0.5, 0.5)
        );
        right.material.pattern = new RadialGradientPattern(
            color(1, 1, 0),
            color(0, 1, 0)
        );
        right.material.pattern.transform = multiply(
            scaling(0.2, 0.2, 0.2),
            multiply(rotationY(radians(-10)), rotationX(radians(80)))
        );
        right.material.diffuse = 0.7;
        right.material.specular = 0.3;

        world.objects.push(front, leftSmall, left, middle, middleBehind, right);

        return world;
    }

    private checkeredRoom(c1: Color, c2: Color): Shape[] {
        const floor = new Plane();
        floor.material.pattern = new Checkers3dPattern(c1, c2);
        floor.material.pattern.transform = multiply(
            translation(0, 0.5, 0),
            rotationY(radians(-45))
        );
        floor.material.specular = 0.8;
        floor.material.reflective = 0.3;

        const ceiling = new Plane();
        ceiling.transform = translation(0, 5, 0);
        ceiling.material.color = c2;
        ceiling.material.ambient = 0.7;
        ceiling.material.specular = 0.8;
        ceiling.material.reflective = 0.1;

        const wallMaterial = material();
        wallMaterial.pattern = new StripePattern(c1, c2);
        wallMaterial.reflective = 0.1;

        const leftWall = new Plane();
        leftWall.transform = multiply(
            translation(0, 0, 10),
            multiply(rotationY(radians(-45)), rotationX(radians(90)))
        );
        leftWall.material = wallMaterial;

        const leftHiddenWall = new Plane();
        leftHiddenWall.transform = multiply(
            translation(0, 0, -10),
            multiply(rotationY(radians(45)), rotationX(radians(90)))
        );
        leftHiddenWall.material = wallMaterial;

        const rightWall = new Plane();
        rightWall.transform = multiply(
            translation(0, 0, 10),
            multiply(rotationY(radians(45)), rotationX(radians(90)))
        );
        rightWall.material = wallMaterial;

        const rightHiddenWall = new Plane();
        rightHiddenWall.transform = multiply(
            translation(0, 0, -10),
            multiply(rotationY(radians(-45)), rotationX(radians(90)))
        );
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
