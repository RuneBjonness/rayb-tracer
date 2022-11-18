import { Color, Tuple } from '../../tuples';
import { Pattern } from '../patterns';
import { UvPattern } from './uv-patterns';
import {
  CubeBackMapper,
  CubeBottomMapper,
  CubeFrontMapper,
  CubeLeftMapper,
  CubeRightMapper,
  CubeTopMapper,
  UvMapper,
} from './uv-mappers';

export class TextureMap extends Pattern {
  constructor(private uvPattern: UvPattern, private uvMapper: UvMapper) {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    const [u, v] = this.uvMapper.map(p);
    return this.uvPattern.colorAt(u, v);
  }
}

export class CubeMap extends Pattern {
  private mappers: UvMapper[] = [
    new CubeLeftMapper(),
    new CubeFrontMapper(),
    new CubeRightMapper(),
    new CubeBackMapper(),
    new CubeTopMapper(),
    new CubeBottomMapper(),
  ];

  constructor(
    private faces: [
      left: UvPattern,
      front: UvPattern,
      right: UvPattern,
      back: UvPattern,
      top: UvPattern,
      bottom: UvPattern
    ]
  ) {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    const faceIdx = this.getFaceIndex(p);
    const [u, v] = this.mappers[faceIdx].map(p);
    return this.faces[faceIdx].colorAt(u, v);
  }

  private getFaceIndex(p: Tuple): number {
    const absX = Math.abs(p[0]);
    const absY = Math.abs(p[1]);
    const absZ = Math.abs(p[2]);
    const coord = Math.max(absX, absY, absZ);

    switch (coord) {
      case -p[0]: {
        return 0; // left
      }
      case p[2]: {
        return 1; // front
      }
      case p[0]: {
        return 2; // right
      }
      case -p[2]: {
        return 3; // back
      }
      case p[1]: {
        return 4; // top
      }
    }
    return 5; // bottom
  }
}
