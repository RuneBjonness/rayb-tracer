import { RenderConfiguration } from '../renderer/configuration';
import { CameraConfiguration } from './configuration';
import { PointLight } from '../lib/lights';
import { material } from '../lib/materials';
import { multiplyMatrices } from '../lib/math/matrices';
import { Sphere } from '../lib/shapes/primitives/sphere';
import {
  translation,
  scaling,
  viewTransform,
} from '../lib/math/transformations';
import { Color } from '../lib/math/color';
import { World } from '../lib/world';
// import negXImgMapFile from '../resources/skybox/negx.ppm?raw';
// import negYImgMapFile from '../resources/skybox/negy.ppm?raw';
// import negZImgMapFile from '../resources/skybox/negz.ppm?raw';
// import posXImgMapFile from '../resources/skybox/posx.ppm?raw';
// import posYImgMapFile from '../resources/skybox/posy.ppm?raw';
// import posZImgMapFile from '../resources/skybox/posz.ppm?raw';
import { parsePPM } from '../tools/ppm-parser';
import { Scene } from './scene';
import { CubeMap } from '../lib/patterns/texture-mapping/texture-map';
import { ImageUvPattern } from '../lib/patterns/texture-mapping/uv-patterns';
import { point, vector } from '../lib/math/vector4';

export class Skybox implements Scene {
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
      new PointLight(point(-4.4, 3.5, 6.4), new Color(0.9, 0.9, 0.9)),
      new PointLight(point(4.5, 4.99, 6.5), new Color(0.3, 0.3, 0.3))
    );

    const skybox = new Sphere();
    skybox.transform = scaling(1000, 1000, 1000);
    skybox.material.diffuse = 0;
    skybox.material.specular = 0;
    skybox.material.ambient = 1;
    // skybox.material.pattern = new CubeMap([
    //   new ImageUvPattern(parsePPM(negXImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(posZImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(posXImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(negZImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(posYImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(negYImgMapFile).pixels),
    // ]);

    const m = material();
    m.diffuse = 0.4;
    m.reflective = 0.6;
    m.specular = 0.6;
    m.shininess = 30;

    const s1 = new Sphere();
    s1.transform = multiplyMatrices(
      translation(2.5, 1, 4),
      scaling(0.8, 0.8, 0.8)
    );
    s1.material = m;

    const s2 = new Sphere();
    s2.transform = multiplyMatrices(
      translation(-2.5, 1, 4),
      scaling(0.8, 0.8, 0.8)
    );
    s2.material = m;

    const s3 = new Sphere();
    s3.transform = multiplyMatrices(
      translation(0, 0, 4),
      scaling(0.8, 0.8, 0.8)
    );
    s3.material = m;

    world.objects.push(skybox, s1, s2, s3);

    return world;
  }
}
