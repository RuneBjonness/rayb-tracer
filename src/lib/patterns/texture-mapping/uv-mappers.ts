import { magnitude, Tuple, vector } from '../../math/tuples';

export interface UvMapper {
  map(p: Tuple): [u: number, v: number];
}

export class SphericalMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    const theta = Math.atan2(p[0], p[2]);
    const vec = vector(p[0], p[1], p[2]);
    const r = magnitude(vec);
    const phi = Math.acos(p[1] / r);
    const rawU = theta / (2 * Math.PI);
    const u = 1 - (rawU + 0.5);
    const v = 1 - phi / Math.PI;
    return [u, v];
  }
}

export class PlanarMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    let u = p[0] % 1;
    let v = p[2] % 1;
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
  map(p: Tuple): [u: number, v: number] {
    const theta = Math.atan2(p[0], p[2]);
    const rawU = theta / (2 * Math.PI);
    const u = 1 - (rawU + 0.5);

    let v = p[1] % 1;
    if (v < 0) {
      v = 1 + v;
    }
    return [u, v];
  }
}

export class CubeLeftMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    let u = ((p[2] + 1) % 2) / 2.0;
    let v = ((p[1] + 1) % 2) / 2.0;
    return [u, v];
  }
}
export class CubeFrontMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    let u = ((p[0] + 1) % 2) / 2.0;
    let v = ((p[1] + 1) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeRightMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    let u = ((1 - p[2]) % 2) / 2.0;
    let v = ((p[1] + 1) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeBackMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    let u = ((1 - p[0]) % 2) / 2.0;
    let v = ((p[1] + 1) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeTopMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    let u = ((p[0] + 1) % 2) / 2.0;
    let v = ((1 - p[2]) % 2) / 2.0;
    return [u, v];
  }
}

export class CubeBottomMapper implements UvMapper {
  map(p: Tuple): [u: number, v: number] {
    let u = ((p[0] + 1) % 2) / 2.0;
    let v = ((p[2] + 1) % 2) / 2.0;
    return [u, v];
  }
}
