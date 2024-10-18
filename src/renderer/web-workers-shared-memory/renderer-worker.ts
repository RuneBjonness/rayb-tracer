import { BufferBackedCamera } from '../../lib/camera/buffer-backed-camera';
import { BufferBackedWorld } from '../../lib/world/buffer-backed-world';

let camera: BufferBackedCamera | null = null;
let w: BufferBackedWorld | null = null;

onmessage = async function (e) {
  if (e.data.command === 'rtRenderTile') {
    const cp: {
      x: number;
      y: number;
      w: number;
      h: number;
    } = e.data.cp;
    const imageData = camera!
      .renderPart(w!, cp.x, cp.y, cp.w, cp.h)
      .getImageData();
    postMessage({ command: 'rtRenderTile', cp, imageData }, [
      imageData.data.buffer,
    ]);
  } else if (e.data.command === 'init') {
    camera = new BufferBackedCamera(e.data.camera);
    w = new BufferBackedWorld(
      e.data.lights,
      e.data.objects,
      e.data.materials,
      e.data.patterns,
      e.data.imageData
    );
    postMessage({ command: 'initComplete' });
  }
};
