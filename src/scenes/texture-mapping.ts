import { CameraConfiguration, RenderConfiguration } from '../lib/configuration';
import { AreaLight, PointLight } from '../lib/lights';
import { multiplyMatrices } from '../lib/matrices';
import {
    TextureMap,
    CubeMap,
} from '../lib/patterns/texture-mapping/texture-map';
import {
    PlanarMapper,
    SphericalMapper,
    CylindricalMapper,
} from '../lib/patterns/texture-mapping/uv-mappers';
import {
    CheckersUvPattern,
    UvAlignTestPattern,
} from '../lib/patterns/texture-mapping/uv-patterns';
import { Cube } from '../lib/shapes/primitives/cube';
import { Cylinder } from '../lib/shapes/primitives/cylinder';
import { Plane } from '../lib/shapes/primitives/plane';
import { Sphere } from '../lib/shapes/primitives/sphere';
import {
    translation,
    scaling,
    viewTransform,
    rotationY,
    radians,
} from '../lib/transformations';
import { point, vector, color } from '../lib/tuples';
import { World } from '../lib/world';
import { Scene } from './scene';

export class TextureMapping implements Scene {
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
            renderCfg.enableAreaLights ?
                new AreaLight(
                    point(-5.5, 3.5, -5),
                    vector(3, 0, 0),
                    renderCfg.maxAreaLightUvSteps,
                    vector(0, 3, 0),
                    renderCfg.maxAreaLightUvSteps,
                    color(1.5, 1.5, 1.5)
                ) :
                new PointLight(point(-5.5, 3.5, -5), color(1.5, 1.5, 1.5))
        );

        const lamp = new Cube();
        lamp.material.color = color(1.5, 1.5, 1.5);
        lamp.material.diffuse = 0;
        lamp.material.specular = 0;
        lamp.material.ambient = 1;
        lamp.transform = multiplyMatrices(
            translation(-4, 5, -5.1),
            scaling(1, 1, 0.01)
        );
        world.objects.push(lamp);

        const rainbow = [
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

        const f = new Plane();
        f.material.pattern = new TextureMap(
            new CheckersUvPattern(
                2,
                2,
                color(0.83, 0.9, 0.95),
                color(0.1, 0.32, 0.46)
            ),
            new PlanarMapper()
        );
        f.material.pattern.transform = multiplyMatrices(
            translation(0, 0.5, 0),
            rotationY(radians(-45))
        );

        const s = new Sphere();
        s.transform = translation(0, 1, 0);
        s.material.pattern = new TextureMap(
            new CheckersUvPattern(
                16,
                8,
                color(1, 0.98, 0.91),
                color(0.95, 0.77, 0.06)
            ),
            new SphericalMapper()
        );
        s.material.diffuse = 0.6;
        s.material.specular = 0;
        s.material.ambient = 0.1;
        s.material.reflective = 0.3;

        const cyl = new Cylinder();
        cyl.minimum = 0;
        cyl.maximum = 1;
        cyl.transform = multiplyMatrices(
            translation(-1.5, -0.5, 2),
            scaling(1, 3.1415, 1)
        );
        cyl.material.pattern = new TextureMap(
            new CheckersUvPattern(
                16,
                8,
                color(0.91, 0.96, 0.95),
                color(0.08, 0.56, 0.47)
            ),
            new CylindricalMapper()
        );
        cyl.material.diffuse = 0.6;
        cyl.material.specular = 0;
        cyl.material.ambient = 0.1;
        cyl.material.reflective = 0.3;

        const cubeMap = new CubeMap([
            new UvAlignTestPattern(
                rainbow[0],
                rainbow[1],
                rainbow[2],
                rainbow[3],
                rainbow[4]
            ),
            new UvAlignTestPattern(
                rainbow[1],
                rainbow[2],
                rainbow[0],
                rainbow[4],
                rainbow[5]
            ),
            new UvAlignTestPattern(
                rainbow[2],
                rainbow[0],
                rainbow[6],
                rainbow[5],
                rainbow[7]
            ),
            new UvAlignTestPattern(
                rainbow[5],
                rainbow[6],
                rainbow[1],
                rainbow[7],
                rainbow[3]
            ),
            new UvAlignTestPattern(
                rainbow[4],
                rainbow[1],
                rainbow[6],
                rainbow[2],
                rainbow[0]
            ),
            new UvAlignTestPattern(
                rainbow[6],
                rainbow[4],
                rainbow[5],
                rainbow[3],
                rainbow[7]
            ),
        ]);

        const cube = new Cube();
        cube.transform = multiplyMatrices(
            translation(1.5, 1, 2),
            rotationY(radians(45))
        );
        cube.material.pattern = cubeMap;
        cube.material.diffuse = 0.6;
        cube.material.specular = 0;
        cube.material.ambient = 0.1;
        cube.material.reflective = 0.3;

        world.objects.push(f, s, cyl, cube);

        return world;
    }
}
