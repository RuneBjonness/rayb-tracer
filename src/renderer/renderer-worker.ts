import { RenderConfiguration } from './configuration';
import { World } from '../lib/world';
import { Camera } from '../lib/camera';
import { createCamera, loadScene, Scene, ScenePreset } from '../scenes/scene';

let scene: Scene;
let world: World;
let camera: Camera;

const init = (scenePreset: ScenePreset, renderCfg: RenderConfiguration) => {
  scene = loadScene(scenePreset);
  world = scene.configureWorld(renderCfg);
  camera = createCamera(scene.cameraCfg, renderCfg);
}

onmessage = function (e) {
  if (e.data[0] === 'init') {
    init(e.data[1], e.data[2]);
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
