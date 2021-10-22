import { AreaLight } from '../lib/lights';
import { multiply } from '../lib/matrices';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Shape } from '../lib/shapes/shape';
import { translation, scaling, viewTransform } from '../lib/transformations';
import { point, vector, color, Color } from '../lib/tuples';
import { World } from '../lib/world';
import { CamerConfiguration, Scene } from './Scene';

export class Marbles implements Scene {
    cameraCfg: CamerConfiguration = {
        fieldOfView: 1.2,
        viewTransform: viewTransform(
            point(0, 1.3, -5),
            point(0, 1, 0),
            vector(0, 1, 0)
        ),
        aperture: 0.08,
        focalLength: 5,
        focalSamplingRate: 8,
    };

    configureWorld(): World {
        const world = new World();
        world.lights.push(
            new AreaLight(
                point(-4, 5, -3),
                vector(3, 0, 0),
                2,
                vector(0, 3, 0),
                2,
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

        world.objects.push(this.glassShere(color(0.1, 0, 0.2), 0.3, 0.4, 0.7));

        world.objects.push(this.basicShere(sphereColors[0], -1.2, 0.2, 0.5));
        world.objects.push(this.basicShere(sphereColors[1], -2.5, 2, 0.75));
        world.objects.push(this.basicShere(sphereColors[2], 1.9, 6, 0.5));
        world.objects.push(this.basicShere(sphereColors[3], 1.3, -2.5, 0.8));
        world.objects.push(this.basicShere(sphereColors[4], -0.4, -1.5, 0.3));
        world.objects.push(this.basicShere(sphereColors[5], -1, 7, 0.5));
        world.objects.push(this.basicShere(sphereColors[6], 0.3, -1.1, 0.3));
        world.objects.push(this.basicShere(sphereColors[7], -1.4, -1.5, 0.5));
        world.objects.push(this.basicShere(sphereColors[8], -1.1, 4, 0.5));
        world.objects.push(this.basicShere(sphereColors[9], -3, 11, 0.5));

        return world;
    }

    private basicShere(
        color: Color,
        x: number,
        z: number,
        scale: number
    ): Shape {
        const s = new Sphere();
        s.transform = multiply(
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

    private glassShere(
        color: Color,
        x: number,
        z: number,
        scale: number
    ): Shape {
        const s = this.basicShere(color, x, z, scale);
        s.material.reflective = 0.9;
        s.material.transparancy = 1;
        s.material.refractiveIndex = 1.5;
        s.material.diffuse = 0.9;
        s.material.specular = 0.9;
        s.material.shininess = 200.0;

        return s;
    }
}
