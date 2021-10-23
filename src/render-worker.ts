import { Camera } from './lib/camera';
import { CsgRb } from './scenes/csg-rb';
import { Dodecahedron } from './scenes/dodecahedron';
import { ImageMapping } from './scenes/image-mapping';
import { Marbles } from './scenes/marbles';
import { Patterns } from './scenes/patterns';
import { Skybox } from './scenes/skybox';
import { TeaPot } from './scenes/teapot';
import { TextureMapping } from './scenes/texture-mapping';

const scene = new CsgRb();
//const scene = new Dodecahedron();
//const scene = new ImageMapping();
//const scene = new Marbles();
//const scene = new Patterns();
//const scene = new Skybox();
//const scene = new TeaPot();
//const scene = new TextureMapping();

const world = scene.configureWorld();

onmessage = function (e) {
    const cfg: {
        fullWidth: number;
        fullHeight: number;
        x: number;
        y: number;
        w: number;
        h: number;
    } = e.data[0];

    const camera = new Camera(cfg.fullWidth, cfg.fullHeight, Math.PI / 3);
    camera.aperture = scene.cameraCfg.aperture;
    camera.focalLength = scene.cameraCfg.focalLength;
    camera.focalSamplingRate = scene.cameraCfg.focalSamplingRate;
    camera.transform = scene.cameraCfg.viewTransform;

    const result = camera.renderPart(world, cfg.x, cfg.y, cfg.w, cfg.h);

    postMessage([cfg, result]);
};
