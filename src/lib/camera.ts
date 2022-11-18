import { identityMatrix, inverse, multiplyMatrixByTuple } from './matrices';
import { Ray, rayFocalPoint, rayToTarget } from './rays';
import { point, Tuple, divideColor, addColors } from './tuples';
import { World } from './world';
import { Canvas } from './canvas';

export class Camera {
  private _transform: number[][] = [];
  public get transform() {
    return this._transform;
  }
  public set transform(m: number[][]) {
    this._transform = m;
    this.invTransform = inverse(m);
    this.origin = multiplyMatrixByTuple(this.invTransform, point(0, 0, 0));
  }

  public pixelSize: number;

  public aperture: number = 0;
  public focalLength: number = 1;
  public focalSamplingRate: number = 2;

  public raysMaxRecursiveDepth: number = 4;

  private halfWidth: number;
  private halfHeight: number;
  private invTransform: number[][] = [];
  private origin: Tuple = point(0, 0, 0);

  constructor(
    public width: number,
    public height: number,
    public fieldOfView: number
  ) {
    this.transform = identityMatrix();

    const halfView = Math.tan(fieldOfView / 2);
    const aspect = width / height;
    if (aspect >= 1) {
      this.halfWidth = halfView;
      this.halfHeight = halfView / aspect;
    } else {
      this.halfWidth = halfView * aspect;
      this.halfHeight = halfView;
    }
    this.pixelSize = (this.halfWidth * 2) / width;
  }

  raysForPixel(x: number, y: number): Ray[] {
    const xOffset = (x + 0.5) * this.pixelSize;
    const yOffset = (y + 0.5) * this.pixelSize;
    const worldX = this.halfWidth - xOffset;
    const worldY = this.halfHeight - yOffset;

    const px = multiplyMatrixByTuple(
      this.invTransform,
      point(worldX, worldY, -1)
    );

    const rays: Ray[] = [];
    if (this.aperture > 0) {
      const fp = rayFocalPoint(this.origin, px, this.focalLength);
      this.sampleApertureOrigins().forEach((o) =>
        rays.push(rayToTarget(o, fp))
      );
    } else {
      rays.push(rayToTarget(this.origin, px));
    }
    return rays;
  }

  render(w: World): Canvas {
    return this.renderPart(w, 0, 0, this.width, this.height);
  }

  renderPart(
    w: World,
    startX: number,
    startY: number,
    lengthX: number,
    lengthY: number
  ): Canvas {
    const c = new Canvas(lengthX, lengthY);
    for (let y = 0; y < lengthY; y++) {
      for (let x = 0; x < lengthX; x++) {
        const samples = this.raysForPixel(startX + x, startY + y).map((r) =>
          w.colorAt(r, this.raysMaxRecursiveDepth)
        );
        c.pixels[x][y] = divideColor(
          samples.reduce((a, b) => addColors(a, b)),
          samples.length
        );
      }
    }
    return c;
  }

  private sampleApertureOrigins(): Tuple[] {
    const pts: Tuple[] = [];
    const baseOffset = -this.aperture / 2.0;
    const uvStep = this.aperture / this.focalSamplingRate;

    for (let v = 0; v < this.focalSamplingRate; v++) {
      for (let u = 0; u < this.focalSamplingRate; u++) {
        pts.push(
          point(
            this.origin[0] + baseOffset + (u + Math.random()) * uvStep,
            this.origin[1] + baseOffset + (v + Math.random()) * uvStep,
            this.origin[2]
          )
        );
      }
    }
    return pts;
  }
}
