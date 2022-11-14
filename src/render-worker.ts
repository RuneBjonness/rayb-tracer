import { getRenderConfiguration } from './lib/configuration';
import { createCamera } from './scenes/scene';

import { CsgRb } from './scenes/csg-rb';
import { Dodecahedron } from './scenes/dodecahedron';
import { ImageMapping } from './scenes/image-mapping';
import { Marbles } from './scenes/marbles';
import { Patterns } from './scenes/patterns';
import { Skybox } from './scenes/skybox';
import { TeaPot } from './scenes/teapot';
import { TextureMapping } from './scenes/texture-mapping';

//const scene = new CsgRb();
//const scene = new Dodecahedron();
//const scene = new ImageMapping();
const scene = new Marbles();
//const scene = new Patterns();
//const scene = new Skybox();
//const scene = new TeaPot();
//const scene = new TextureMapping();


const renderCfg = getRenderConfiguration(800, 600, 'preview');

const workerCreateTime = performance.now()
const world = scene.configureWorld(renderCfg);
console.log(
    `     --Worker inited in ${(performance.now() - workerCreateTime).toFixed(0)
    } ms`,
);

onmessage = function (e) {
    const cfg: {
        x: number;
        y: number;
        w: number;
        h: number;
    } = e.data[0];

    const camera = createCamera(scene.cameraCfg, renderCfg)
    const result = camera.renderPart(world, cfg.x, cfg.y, cfg.w, cfg.h);

    postMessage([cfg, result]);
};
