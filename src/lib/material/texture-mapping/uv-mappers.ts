import { Vector4, vector } from '../../math/vector4';

export interface UvMapper {
  map(p: Vector4): [u: number, v: number];
}

export class SphericalMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    const theta = Math.atan2(p.x, p.z);
    const vec = vector(p.x, p.y, p.z);
    const r = vec.magnitude();
    const phi = Math.acos(p.y / r);
    const rawU = theta / (2 * Math.PI);
    const u = 1 - (rawU + 0.5);
    const v = 1 - phi / Math.PI;
    return [u, v];
  }
}

export class PlanarMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    let u = p.x % 1;
    let v = p.z % 1;
    if (u < 0) {
      u = 1 + u;
    }
    if (v < 0) {
      v = 1 + v;
    }
    return [u, v];
  }
}

export class CylindricalMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    const theta = Math.atan2(p.x, p.z);
    const rawU = theta / (2 * Math.PI);
    const u = 1 - (rawU + 0.5);

    let v = p.y % 1;
    if (v < 0) {
      v = 1 + v;
    }
    return [u, v];
  }
}

export class CubeLeftMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    let u = ((p.z + 1) % 2) / 2.0;
    let v = ((p.y + 1) % 2) / 2.0;
    return [u, v];
  }
}
export class CubeFrontMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    let u = ((p.x + 1) % 2) / 2.0;
    let v = ((p.y + 1) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeRightMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    let u = ((1 - p.z) % 2) / 2.0;
    let v = ((p.y + 1) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeBackMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    let u = ((1 - p.x) % 2) / 2.0;
    let v = ((p.y + 1) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeTopMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    let u = ((p.x + 1) % 2) / 2.0;
    let v = ((1 - p.z) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeBottomMapper implements UvMapper {
  map(p: Vector4): [u: number, v: number] {
    let u = ((p.x + 1) % 2) / 2.0;
    let v = ((p.z + 1) % 2) / 2.0;
    return [u, v];
  }
}
