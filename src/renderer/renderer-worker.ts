import { Scene } from '../scenes/scene';
import { loadScene } from '../scenes/scene-preset';

let scene: Scene;

onmessage = function (e) {
  if (e.data.command === 'init') {
    scene = new Scene(JSON.parse(e.data.definition), e.data.renderCfg);
  } else if (e.data.command === 'initPreset') {
    scene = loadScene(e.data.scenePreset, e.data.renderCfg);
  } else if (e.data.command === 'rtRenderTile') {
    const cp: {
      x: number;
      y: number;
      w: number;
      h: number;
    } = e.data.cp;

    const imageData = scene.renderTile(cp.x, cp.y, cp.w, cp.h);
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
