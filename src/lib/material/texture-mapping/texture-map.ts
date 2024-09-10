import { Color } from '../../math/color';
import { Pattern, PatternType } from '../patterns';
import { UvPattern } from './uv-patterns';
import { UvMapper, map } from './uv-mappers';
import { Vector4 } from '../../math/vector4';
import { PATTERN_BYTE_SIZE } from '../patterns-buffer';

export class TextureMap extends Pattern {
  constructor(
    private uvPattern: UvPattern,
    private uvMapper: UvMapper
  ) {
    super();
    this.type =
      uvPattern.type === 'checkers'
        ? PatternType.TextureMapCheckers
        : PatternType.TextureMapImage;
  }

  protected localColorAt(p: Vector4): Color {
    const [u, v] = map(p, this.uvMapper);
    return this.uvPattern.colorAt(u, v);
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const u32view = new Uint32Array(buffer, offset, 2);
    u32view[1] = this.uvMapper;

    this.uvPattern.copyCustomToArrayBuffer(buffer, offset);
    return offset + PATTERN_BYTE_SIZE;
  }
}

export class CubeMap extends Pattern {
  private mappers: UvMapper[] = [
    UvMapper.CubeLeft,
    UvMapper.CubeFront,
    UvMapper.CubeRight,
    UvMapper.CubeBack,
    UvMapper.CubeTop,
    UvMapper.CubeBottom,
  ];

  constructor(
    private faces: [
      left: UvPattern,
      front: UvPattern,
      right: UvPattern,
      back: UvPattern,
      top: UvPattern,
      bottom: UvPattern,
    ]
  ) {
    super();
    this.type = PatternType.CubeMap;
  }

  protected localColorAt(p: Vector4): Color {
    const faceIdx = this.getFaceIndex(p);
    const [u, v] = map(p, this.mappers[faceIdx]);
    return this.faces[faceIdx].colorAt(u, v);
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const idx = offset + PATTERN_BYTE_SIZE;
    const u32view = new Uint32Array(buffer, offset, 4);
    u32view[2] = idx + 1;
    u32view[3] = idx + 6;

    var nextOffset = offset + PATTERN_BYTE_SIZE;
    for (let i = 0; i < 6; i++) {
      this.faces[i].copyCustomToArrayBuffer(buffer, nextOffset);
      nextOffset += PATTERN_BYTE_SIZE;
    }

    return nextOffset;
  }

  arrayBufferByteLength(): number {
    return PATTERN_BYTE_SIZE * 7;
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
