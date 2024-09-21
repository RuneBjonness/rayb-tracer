import { BufferBackedCamera } from '../../lib/camera';
import { PointLight } from '../../lib/lights';
import { material } from '../../lib/material/materials';
import { Color } from '../../lib/math/color';
import { scaling } from '../../lib/math/transformations';
import { point } from '../../lib/math/vector4';
import { TransformableSphere } from '../../lib/shapes/primitives/sphere';
import { World } from '../../lib/world';

let camera: BufferBackedCamera | null = null;
const w = new World();
w.lights.push(new PointLight(point(-10, 10, -10), new Color(1, 1, 1)));

const mat = material();
mat.color = new Color(0.8, 1.0, 0.6);
mat.diffuse = 0.7;
mat.specular = 0.2;

const mats = [material(), mat];

const s1 = new TransformableSphere();
s1.materialDefinitions = mats;
s1.materialIdx = 1;
w.objects.push(s1);

const s2 = new TransformableSphere();
s2.materialDefinitions = mats;
s2.materialIdx = 0;
s2.transform = scaling(0.5, 0.5, 0.5);
w.objects.push(s2);

onmessage = async function (e) {
  if (e.data.command === 'rtRenderTile') {
    const cp: {
      x: number;
      y: number;
      w: number;
      h: number;
    } = e.data.cp;
    const imageData = camera!
      .renderPart(w, cp.x, cp.y, cp.w, cp.h)
      .getImageData();
    postMessage({ command: 'rtRenderTile', cp, imageData }, [
      imageData.data.buffer,
    ]);
  } else if (e.data.command === 'init') {
    camera = new BufferBackedCamera(e.data.camera);

    // console.log(e.data.lights);
    // console.log(e.data.objects);
    // console.log(e.data.materials);
    // console.log(e.data.patterns);
    // console.log(e.data.imageData);
    postMessage({ command: 'initComplete' });
  }
};
