import { Matrix4 } from './math/matrices';
import { Vector4 } from './math/vector4';

export class Ray {
  constructor(public origin: Vector4, public direction: Vector4) {}

  public clone(): Ray {
    return new Ray(this.origin.clone(), this.direction.clone());
  }

  public position(time: number): Vector4 {
    return this.direction.clone().scale(time).add(this.origin);
  }

  public transform(m: Matrix4): Ray {
    this.origin.applyMatrix(m);
    this.direction.applyMatrix(m);
    return this;
  }
}

export function rayToTarget(origin: Vector4, target: Vector4): Ray {
  const direction = target.clone().subtract(origin).normalize();
  return new Ray(origin, direction);
}

export function rayFocalPoint(
  origin: Vector4,
  target: Vector4,
  focalDistance: number
): Vector4 {
  return rayToTarget(origin, target).position(focalDistance);
}
