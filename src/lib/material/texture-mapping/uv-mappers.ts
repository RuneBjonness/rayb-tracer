import { Vector4, vector } from '../../math/vector4';

export enum UvMapper {
  Planar = 0,
  Spherical = 1,
  Cylindrical = 2,
  CubeLeft = 3,
  CubeFront = 4,
  CubeRight = 5,
  CubeBack = 6,
  CubeTop = 7,
  CubeBottom = 8,
}

export function map(p: Vector4, uvMapper: UvMapper): [u: number, v: number] {
  switch (uvMapper) {
    case UvMapper.Spherical: {
      return mapSpherical(p);
    }
    case UvMapper.Planar: {
      return mapPlanar(p);
    }
    case UvMapper.Cylindrical: {
      return mapCylindrical(p);
    }
    case UvMapper.CubeLeft: {
      return mapCubeLeft(p);
    }
    case UvMapper.CubeFront: {
      return mapCubeFront(p);
    }
    case UvMapper.CubeRight: {
      return mapCubeRight(p);
    }
    case UvMapper.CubeBack: {
      return mapCubeBack(p);
    }
    case UvMapper.CubeTop: {
      return mapCubeTop(p);
    }
    case UvMapper.CubeBottom: {
      return mapCubeBottom(p);
    }
  }
}

function mapSpherical(p: Vector4): [u: number, v: number] {
  const theta = Math.atan2(p.x, p.z);
  const vec = vector(p.x, p.y, p.z);
  const r = vec.magnitude();
  const phi = Math.acos(p.y / r);
  const rawU = theta / (2 * Math.PI);
  const u = 1 - (rawU + 0.5);
  const v = 1 - phi / Math.PI;
  return [u, v];
}

function mapPlanar(p: Vector4): [u: number, v: number] {
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

function mapCylindrical(p: Vector4): [u: number, v: number] {
  const theta = Math.atan2(p.x, p.z);
  const rawU = theta / (2 * Math.PI);
  const u = 1 - (rawU + 0.5);

  let v = p.y % 1;
  if (v < 0) {
    v = 1 + v;
  }
  return [u, v];
}

function mapCubeLeft(p: Vector4): [u: number, v: number] {
  let u = ((p.z + 1) % 2) / 2.0;
  let v = ((p.y + 1) % 2) / 2.0;
  return [u, v];
}

function mapCubeFront(p: Vector4): [u: number, v: number] {
  let u = ((p.x + 1) % 2) / 2.0;
  let v = ((p.y + 1) % 2) / 2.0;
  return [u, v];
}

function mapCubeRight(p: Vector4): [u: number, v: number] {
  let u = ((1 - p.z) % 2) / 2.0;
  let v = ((p.y + 1) % 2) / 2.0;
  return [u, v];
}

function mapCubeBack(p: Vector4): [u: number, v: number] {
  let u = ((1 - p.x) % 2) / 2.0;
  let v = ((p.y + 1) % 2) / 2.0;
  return [u, v];
}

function mapCubeTop(p: Vector4): [u: number, v: number] {
  let u = ((p.x + 1) % 2) / 2.0;
  let v = ((1 - p.z) % 2) / 2.0;
  return [u, v];
}

function mapCubeBottom(p: Vector4): [u: number, v: number] {
  let u = ((p.x + 1) % 2) / 2.0;
  let v = ((p.z + 1) % 2) / 2.0;
  return [u, v];
}
