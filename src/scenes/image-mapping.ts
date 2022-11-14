import { PointLight } from '../lib/lights';
import { multiplyMatrices } from '../lib/matrices';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { translation, scaling, viewTransform } from '../lib/transformations';
import { point, vector, color } from '../lib/tuples';
import { World } from '../lib/world';
import { SphericalMapper } from '../lib/patterns/texture-mapping/uv-mappers';
import moonImgMapFile from '../resources/moon.ppm?raw';
import { parsePPM } from '../tools/ppm-parser';
import { Scene } from './scene';
import { TextureMap } from '../lib/patterns/texture-mapping/texture-map';
import { ImageUvPattern } from '../lib/patterns/texture-mapping/uv-patterns';
import { CameraConfiguration, RenderConfiguration } from '../lib/configuration';

export class ImageMapping implements Scene {
    cameraCfg: CameraConfiguration = {
        fieldOfView: Math.PI / 3,
        viewTransform: viewTransform(
            point(0, 1.5, -5),
            point(0, 1, 0),
            vector(0, 1, 0)
        ),
        aperture: 0,
        focalLength: 0,
    };

    configureWorld(_renderCfg: RenderConfiguration): World {
        const world = new World();
        world.lights.push(
            new PointLight(point(-2.4, 3.5, -2.4), color(0.9, 0.9, 0.9))
        );

        const img = parsePPM(moonImgMapFile);

        const s = new Sphere();
        s.transform = multiplyMatrices(translation(0, 1, 0), scaling(1.8, 1.8, 1.8));
        s.material.pattern = new TextureMap(
            new ImageUvPattern(img.pixels),
            new SphericalMapper()
        );
        s.material.specular = 0;
        s.material.ambient = 0.05

        world.objects.push(s);

        return world;
    }
}
