import { Color } from '../../math/color';
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
import { Vector4 } from '../../math/vector4';

export class TextureMap extends Pattern {
  constructor(private uvPattern: UvPattern, private uvMapper: UvMapper) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
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

  protected localColorAt(p: Vector4): Color {
    const faceIdx = this.getFaceIndex(p);
    const [u, v] = this.mappers[faceIdx].map(p);
    return this.faces[faceIdx].colorAt(u, v);
  }

  private getFaceIndex(p: Vector4): number {
    const absX = Math.abs(p.x);
    const absY = Math.abs(p.y);
    const absZ = Math.abs(p.z);
    const coord = Math.max(absX, absY, absZ);

    switch (coord) {
      case -p.x: {
        return 0; // left
      }
      case p.z: {
        return 1; // front
      }
      case p.x: {
        return 2; // right
      }
      case -p.z: {
        return 3; // back
      }
      case p.y: {
        return 4; // top
      }
    }
    return 5; // bottom
  }
}
