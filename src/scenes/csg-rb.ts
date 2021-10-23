import { AreaLight } from '../lib/lights';
import { material } from '../lib/materials';
import { multiply } from '../lib/matrices';
import { CsgShape } from '../lib/shapes/csg-shape';
import { Group } from '../lib/shapes/group';
import { Cube } from '../lib/shapes/primitives/cube';
import { Cylinder } from '../lib/shapes/primitives/cylinder';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Shape } from '../lib/shapes/shape';
import {
    translation,
    scaling,
    viewTransform,
    rotationY,
    rotationX,
    shearing,
} from '../lib/transformations';
import { point, vector, color } from '../lib/tuples';
import { World } from '../lib/world';
import { CamerConfiguration, Scene } from './Scene';

export class CsgRb implements Scene {
    private baseMaterial = material();

    constructor() {
        this.baseMaterial.color = color(1, 0, 0);
        this.baseMaterial.reflective = 0.3;
    }

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
                4,
                vector(0, 3, 0),
                4,
                color(1.5, 1.5, 1.5)
            )
        );

        const lamp = new Sphere();
        lamp.material.color = color(1.5, 1.5, 1.5);
        lamp.material.diffuse = 0;
        lamp.material.specular = 0;
        lamp.material.ambient = 1;
        lamp.transform = multiply(
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

        const rb = new Group();
        const r = this.letterR();
        r.transform = translation(-1, 0, 0);
        const b = this.letterB();
        b.transform = translation(1, 0, 0);
        rb.add(r);
        rb.add(b);

        rb.transform = multiply(
            translation(0, 1.5, 3),
            multiply(
                scaling(0.5, 0.5, 0.5),
                multiply(rotationY(Math.PI / 6), rotationX(-Math.PI / 2))
            )
        );
        rb.divide(2);

        world.objects.push(rb);

        return world;
    }

    private halfCircle(): Shape {
        const outerCylinder = new Cylinder();
        outerCylinder.minimum = 0;
        outerCylinder.maximum = 0.5;
        outerCylinder.closed = true;
        outerCylinder.material = this.baseMaterial;

        const innerCylinder = new Cylinder();
        innerCylinder.minimum = 0;
        innerCylinder.maximum = 0.6;
        innerCylinder.closed = true;
        innerCylinder.transform = scaling(0.5, 1, 0.5);
        innerCylinder.material = this.baseMaterial;

        const circle = new CsgShape('difference', outerCylinder, innerCylinder);

        const cube = new Cube();
        cube.transform = translation(-1, 0, 0);

        return new CsgShape('difference', circle, cube);
    }

    private letterP(): Shape {
        const leftLeg = new Cube();
        leftLeg.material = this.baseMaterial;
        leftLeg.transform = multiply(
            translation(-0.25, 0, -1),
            scaling(0.25, 0.5, 2)
        );

        return new CsgShape('union', leftLeg, this.halfCircle());
    }

    private letterR(): Shape {
        const rightLeg = new Cube();
        rightLeg.material = this.baseMaterial;
        rightLeg.transform = multiply(
            translation(0.5, 0, -1.9),
            multiply(scaling(0.25, 0.5, 1.1), shearing(0, -1, 0, 0, 0, 0))
        );

        return new CsgShape('union', rightLeg, this.letterP());
    }

    private letterB(): Shape {
        const lowerHalfCircle = this.halfCircle();
        lowerHalfCircle.material = this.baseMaterial;
        lowerHalfCircle.transform = multiply(
            translation(0, 0, -1.9),
            scaling(1.3, 1, 1.2)
        );

        return new CsgShape('union', lowerHalfCircle, this.letterP());
    }
}
