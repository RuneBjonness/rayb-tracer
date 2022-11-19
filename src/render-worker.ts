import { RenderConfiguration } from './lib/configuration';
import { World } from './lib/world';
import { Camera } from './lib/camera';
import { createCamera, Scene } from './scenes/scene';

import { CsgRb } from './scenes/csg-rb';
import { Dodecahedron } from './scenes/dodecahedron';
import { ImageMapping } from './scenes/image-mapping';
import { Marbles } from './scenes/marbles';
import { Patterns } from './scenes/patterns';
import { Skybox } from './scenes/skybox';
import { TeaPot } from './scenes/teapot';
import { TextureMapping } from './scenes/texture-mapping';


let scene: Scene;
let world: World;
let camera: Camera;

const init = (renderCfg: RenderConfiguration) => {
  scene = new CsgRb();
  //scene = new Dodecahedron();
  //scene = new ImageMapping();
  //scene = new Marbles();
  //scene = new Patterns();
  //scene = new Skybox();
  //scene = new TeaPot();
  //scene = new TextureMapping();
  world = scene.configureWorld(renderCfg);
  camera = createCamera(scene.cameraCfg, renderCfg);
}

onmessage = function (e) {
  if (e.data[0] === 'init') {
    init(e.data[1]);
  }
  else if (e.data[0] === 'render') {
    const cfg: {
      x: number;
      y: number;
      w: number;
      h: number;
    } = e.data[1];

    const result = camera.renderPart(world, cfg.x, cfg.y, cfg.w, cfg.h);

    postMessage([cfg, result]);
  }
};
