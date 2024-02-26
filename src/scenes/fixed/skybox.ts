import { RenderConfiguration } from '../../renderer/configuration';
import { PointLight } from '../../lib/lights';
import { material } from '../../lib/material/materials';
import { TransformableSphere } from '../../lib/shapes/primitives/sphere';
import { translation, scaling } from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
// import negXImgMapFile from '../resources/skybox/negx.ppm?raw';
// import negYImgMapFile from '../resources/skybox/negy.ppm?raw';
// import negZImgMapFile from '../resources/skybox/negz.ppm?raw';
// import posXImgMapFile from '../resources/skybox/posx.ppm?raw';
// import posYImgMapFile from '../resources/skybox/posy.ppm?raw';
// import posZImgMapFile from '../resources/skybox/posz.ppm?raw';
// import { parsePPM } from '../../tools/ppm-parser';
import { Scene } from '../scene';
// import { CubeMap } from '../../lib/patterns/texture-mapping/texture-map';
// import { ImageUvPattern } from '../../lib/patterns/texture-mapping/uv-patterns';
import { point } from '../../lib/math/vector4';
import { Cube } from '../../lib/shapes/primitives/cube';

export class Skybox extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'Skybox',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: [0, 1.5, -5],
            to: [0, 1, 0],
            up: [0, 1, 0],
          },
          aperture: 0,
          focalDistance: 0,
        },
        world: {},
      },
      renderCfg
    );
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(_renderCfg: RenderConfiguration): World {
    const world = new World();
    world.lights.push(
      new PointLight(point(-4.4, 3.5, 6.4), new Color(0.9, 0.9, 0.9)),
      new PointLight(point(4.5, 4.99, 6.5), new Color(0.3, 0.3, 0.3))
    );

    const skyboxMaterial = material();
    skyboxMaterial.diffuse = 0;
    skyboxMaterial.specular = 0;
    skyboxMaterial.ambient = 1;
    // skybox.material.pattern = new CubeMap([
    //   new ImageUvPattern(parsePPM(negXImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(posZImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(posXImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(negZImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(posYImgMapFile).pixels),
    //   new ImageUvPattern(parsePPM(negYImgMapFile).pixels),
    // ]);
    this.materials.push(skyboxMaterial);

    const skybox = new Cube();
    skybox.transform = scaling(1000, 1000, 1000);
    skybox.materialDefinitions = this.materials;
    skybox.material = skyboxMaterial;

    const m = material();
    m.diffuse = 0.4;
    m.reflective = 0.6;
    m.specular = 0.6;
    m.shininess = 30;
    this.materials.push(m);

    const s1 = new TransformableSphere();
    s1.transform = translation(2.5, 1, 4).multiply(scaling(0.8, 0.8, 0.8));
    s1.materialDefinitions = this.materials;
    s1.material = m;

    const s2 = new TransformableSphere();
    s2.transform = translation(-2.5, 1, 4).multiply(scaling(0.8, 0.8, 0.8));
    s2.materialDefinitions = this.materials;
    s2.material = m;

    const s3 = new TransformableSphere();
    s3.transform = translation(0, 0, 4).multiply(scaling(0.8, 0.8, 0.8));
    s3.materialDefinitions = this.materials;
    s3.material = m;

    world.objects.push(skybox, s1, s2, s3);

    return world;
  }
}
