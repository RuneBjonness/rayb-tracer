import each from 'jest-each';
import { Sphere } from '../../shapes/primitives/sphere';
import { color, point } from '../../tuples';
import { TextureMap } from './texture-map';
import { SphericalMapper } from './uv-mappers';
import { CheckersUvPattern } from './uv-patterns';

describe('Texture maps', () => {
    const black = color(0, 0, 0);
    const white = color(1, 1, 1);

    each`
        p                                   | result
        ${point(0.4315, 0.467, 0.7719)}     | ${white}
        ${point(-0.9654, 0.2552, -0.0534)}  | ${black}
        ${point(0.1039, 0.709, 0.6975)}     | ${white}
        ${point(-0.4986, -0.7856, -0.3663)} | ${black}
        ${point(-0.0317, -0.9395, 0.3411)}  | ${black}
        ${point(0.4809, -0.7721, 0.4154)}   | ${black}
        ${point(0.0285, -0.9612, -0.2745)}  | ${black}
        ${point(-0.5734, -0.2162, -0.7903)} | ${white}
        ${point(0.7688, -0.147, 0.6223)}    | ${black}
        ${point(-0.7652, 0.2175, 0.606)}    | ${black}
    `.test(
        'Using a texture map pattern with a spherical map',
        ({ p, result }) => {
            const uvCheckers = new CheckersUvPattern(16, 8, black, white);
            const uvMapper = new SphericalMapper();
            const tm = new TextureMap(uvCheckers, uvMapper);
            const s = new Sphere();

            expect(tm.colorAt(s, p)).toEqual(result);
        }
    );
});
