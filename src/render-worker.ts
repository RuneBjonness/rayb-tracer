import { Camera } from './lib/camera';
import { Marbles } from './scenes/marbles';
//import { PlayGround } from './scenes/playground';

//const scene = new PlayGround();
const scene = new Marbles();
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
