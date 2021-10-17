import { Camera } from './lib/camera';
import { viewTransform } from './lib/transformations';
import { point, vector } from './lib/tuples';
import { configureWorld } from './playground';

const world = configureWorld();

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
    camera.aperture = 0.005;
    camera.focalLength = 2.5;
    camera.focalSamplingRate = 6;
    camera.transform = viewTransform(
        point(0, 1.5, -5),
        point(0, 1, 0),
        vector(0, 1, 0)
    );

    const result = camera.renderPart(world, cfg.x, cfg.y, cfg.w, cfg.h);

    postMessage([cfg, result]);
};
