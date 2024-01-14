import each from 'jest-each';
import { Cube } from '../../shapes/primitives/cube';
import { Sphere } from '../../shapes/primitives/sphere';
import { Color } from '../../math/color';
import { CubeMap, TextureMap } from './texture-map';
import { SphericalMapper } from './uv-mappers';
import { CheckersUvPattern, UvAlignTestPattern } from './uv-patterns';
import { point } from '../../math/vector4';

describe('Texture maps', () => {
  const black = new Color(0, 0, 0);
  const white = new Color(1, 1, 1);

  const uvCheckers = new CheckersUvPattern(16, 8, black, white);
  const uvMapper = new SphericalMapper();
  const tm = new TextureMap(uvCheckers, uvMapper);
  const s = new Sphere();

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
      expect(tm.colorAt(s, p)).toEqual(result);
    }
  );
});

describe('Cube maps', () => {
  const red = new Color(1, 0, 0);
  const yellow = new Color(1, 1, 0);
  const brown = new Color(1, 0.5, 0);
  const green = new Color(0, 1, 0);
  const cyan = new Color(0, 1, 1);
  const blue = new Color(0, 0, 1);
  const purple = new Color(1, 0, 1);
  const white = new Color(1, 1, 1);

  const cubeMap = new CubeMap([
    new UvAlignTestPattern(yellow, cyan, red, blue, brown),
    new UvAlignTestPattern(cyan, red, yellow, brown, green),
    new UvAlignTestPattern(red, yellow, purple, green, white),
    new UvAlignTestPattern(green, purple, cyan, white, blue),
    new UvAlignTestPattern(brown, cyan, purple, red, yellow),
    new UvAlignTestPattern(purple, brown, green, blue, white),
  ]);

  const cube = new Cube();

  each`
        case      | p                        | result
        ${'L m'}  | ${point(-1, 0, 0)}       | ${yellow}
        ${'L ul'} | ${point(-1, 0.9, -0.9)}  | ${cyan}
        ${'L ur'} | ${point(-1, 0.9, 0.9)}   | ${red}
        ${'L bl'} | ${point(-1, -0.9, -0.9)} | ${blue}
        ${'L br'} | ${point(-1, -0.9, 0.9)}  | ${brown}
        ${'F m'}  | ${point(0, 0, 1)}        | ${cyan}
        ${'F ul'} | ${point(-0.9, 0.9, 1)}   | ${red}
        ${'F ur'} | ${point(0.9, 0.9, 1)}    | ${yellow}
        ${'F bl'} | ${point(-0.9, -0.9, 1)}  | ${brown}
        ${'F br'} | ${point(0.9, -0.9, 1)}   | ${green}
        ${'R m'}  | ${point(1, 0, 0)}        | ${red}
        ${'R ul'} | ${point(1, 0.9, 0.9)}    | ${yellow}
        ${'R ur'} | ${point(1, 0.9, -0.9)}   | ${purple}
        ${'R bl'} | ${point(1, -0.9, 0.9)}   | ${green}
        ${'R br'} | ${point(1, -0.9, -0.9)}  | ${white}
        ${'B m'}  | ${point(0, 0, -1)}       | ${green}
        ${'B ul'} | ${point(0.9, 0.9, -1)}   | ${purple}
        ${'B ur'} | ${point(-0.9, 0.9, -1)}  | ${cyan}
        ${'B bl'} | ${point(0.9, -0.9, -1)}  | ${white}
        ${'B br'} | ${point(-0.9, -0.9, -1)} | ${blue}
        ${'U m'}  | ${point(0, 1, 0)}        | ${brown}
        ${'U ul'} | ${point(-0.9, 1, -0.9)}  | ${cyan}
        ${'U ur'} | ${point(0.9, 1, -0.9)}   | ${purple}
        ${'U bl'} | ${point(-0.9, 1, 0.9)}   | ${red}
        ${'U br'} | ${point(0.9, 1, 0.9)}    | ${yellow}
        ${'D m'}  | ${point(0, -1, 0)}       | ${purple}
        ${'D ul'} | ${point(-0.9, -1, 0.9)}  | ${brown}
        ${'D ur'} | ${point(0.9, -1, 0.9)}   | ${green}
        ${'D bl'} | ${point(-0.9, -1, -0.9)} | ${blue}
        ${'D br'} | ${point(0.9, -1, -0.9)}  | ${white}
    `.test('face alignment at $case', ({ p, result }) => {
    expect(cubeMap.colorAt(cube, p)).toEqual(result);
  });
});
