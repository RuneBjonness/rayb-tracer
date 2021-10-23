import { PointLight } from '../lib/lights';
import { multiply } from '../lib/matrices';
import { scaling, viewTransform, rotationX } from '../lib/transformations';
import { point, vector, color } from '../lib/tuples';
import { World } from '../lib/world';
import { CamerConfiguration, Scene } from './Scene';
import { ObjParser } from '../tools/obj-parser';
import teapotLowResObjFile from '../resources/teapot-lowres.obj?raw';
import teapotObjFile from '../resources/teapot.obj?raw';
import { Shape } from '../lib/shapes/shape';
import { Plane } from '../lib/shapes/primitives/plane';

export class TeaPot implements Scene {
    cameraCfg: CamerConfiguration = {
        fieldOfView: Math.PI / 3,
        viewTransform: viewTransform(
            point(0, 1.5, -5),
            point(0, 1, 0),
            vector(0, 1, 0)
        ),
        aperture: 0,
        focalLength: 0,
        focalSamplingRate: 0,
    };

    configureWorld(): World {
        const world = new World();
        world.lights.push(
            new PointLight(point(-2.4, 3.5, -2.4), color(0.9, 0.9, 0.9))
        );

        const f = new Plane();
        f.material.specular = 0;
        f.material.ambient = 0.025;
        f.material.diffuse = 0.67;

        world.objects.push(f, this.teapotObj(true));

        return world;
    }

    private teapotObj(highRes: boolean): Shape {
        const parser = new ObjParser();
        const model = parser.parse(
            highRes ? teapotObjFile : teapotLowResObjFile
        );
        model.transform = multiply(
            scaling(0.1, 0.1, 0.1),
            rotationX(-Math.PI / 2)
        );
        return model;
    }
}
