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
};

onmessage = function (e) {
  if (e.data.command === 'init') {
    init(e.data.scenePreset, e.data.renderCfg);
  } else if (e.data.command === 'rtRenderTile') {
    const cp: {
      x: number;
      y: number;
      w: number;
      h: number;
    } = e.data.cp;

    const imageData = camera
      .renderPart(world, cp.x, cp.y, cp.w, cp.h)
      .getImageData();
    postMessage({ command: 'rtRenderTile', cp, imageData }, [
      imageData.data.buffer,
    ]);
  } else if (e.data.command === 'photonMapperIteration') {
    console.log(
      'Worker photonMapperIteration - number of photons: ',
      e.data.photons
    );
    postMessage({ command: 'photonMapperIteration' });
  }
};
