import { Matrix4, MatrixOrder } from './math/matrices';
import { Ray, rayFocalPoint, rayToTarget } from './rays';
import { World } from './world';
import { Canvas } from './canvas';
import { Vector4, point } from './math/vector4';

export class Camera {
  private _transform: Matrix4;
  public get transform() {
    return this._transform;
  }
  public set transform(m: Matrix4) {
    this._transform = m;
    this.invTransform = m.clone().inverse();
    this.origin = point(0, 0, 0).applyMatrix(this.invTransform);
  }

  public pixelSize: number;

  public aperture: number = 0;
  public focalDistance: number = 1;
  public maxFocalSamples: number = 1;
  public adaptiveSamplingColorSensitivity: number = 1;

  public maxDepth: number = 4;
  public maxIndirectLightSamples: number = 0;

  private halfWidth: number;
  private halfHeight: number;
  private invTransform: Matrix4;
  private origin: Vector4 = point(0, 0, 0);

  private uvSampleConfig = this.initUvSampleConfig();

  constructor(
    public width: number,
    public height: number,
    public fieldOfView: number
  ) {
    this._transform = new Matrix4();
    this.invTransform = new Matrix4();
    this.origin = point(0, 0, 0);

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

    const px = point(worldX, worldY, -1).applyMatrix(this.invTransform);

    const rays: Ray[] = [];
    if (this.aperture > 0) {
      const fp = rayFocalPoint(this.origin, px, this.focalDistance);
      const samples = this.sampleApertureOrigins();
      for (let i = 0; i < samples.length; i++) {
        rays.push(rayToTarget(samples[i], fp));
      }
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
    // const debugStats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const c = new Canvas(lengthX, lengthY);
    for (let y = 0; y < lengthY; y++) {
      for (let x = 0; x < lengthX; x++) {
        const rays = this.raysForPixel(startX + x, startY + y);
        if (rays.length === 1) {
          c.pixels[x][y] = w.colorAt(
            rays[0],
            this.maxDepth,
            this.maxIndirectLightSamples
          );
        } else {
          const sumSamples = w.colorAt(
            rays[0],
            this.maxDepth,
            this.maxIndirectLightSamples
          );
          let avgSampleColor = sumSamples.clone();
          let rayPassStartingIndex = 1;
          for (let p = 1; p < 9; p++) {
            const currentPassSampleCount = Math.min(
              this.uvSampleConfig.filter((cfg) => cfg.pass === p).length,
              rays.length - rayPassStartingIndex
            );

            for (
              let r = rayPassStartingIndex;
              r < rayPassStartingIndex + currentPassSampleCount;
              r++
            ) {
              sumSamples.add(
                w.colorAt(rays[r], this.maxDepth, this.maxIndirectLightSamples)
              );
            }
            const newAvgSampleColor = sumSamples
              .clone()
              .divideByScalar(rayPassStartingIndex + currentPassSampleCount);

            if (
              Math.abs(avgSampleColor.r - newAvgSampleColor.r) <=
                this.adaptiveSamplingColorSensitivity &&
              Math.abs(avgSampleColor.g - newAvgSampleColor.g) <=
                this.adaptiveSamplingColorSensitivity &&
              Math.abs(avgSampleColor.b - newAvgSampleColor.b) <=
                this.adaptiveSamplingColorSensitivity
            ) {
              avgSampleColor = newAvgSampleColor;
              // debugStats[p]++;
              break;
            }
            avgSampleColor = newAvgSampleColor;
            rayPassStartingIndex += currentPassSampleCount;

            if (rayPassStartingIndex >= rays.length) {
              // debugStats[p]++;
              break;
            }
          }

          c.pixels[x][y] = avgSampleColor;
        }
      }
    }
    // console.log(debugStats);
    return c;
  }

  toArrayBuffer(
    useSharedArrayBuffer: boolean,
    matrixOrder: MatrixOrder
  ): ArrayBufferLike {
    const buffer = useSharedArrayBuffer
      ? new SharedArrayBuffer(27 * 4)
      : new ArrayBuffer(27 * 4);
    const view = new Float32Array(buffer);
    const u32view = new Uint32Array(buffer);

    view[0] = this.origin.x;
    view[1] = this.origin.y;
    view[2] = this.origin.z;

    this.invTransform.copyToArrayBuffer(buffer, 4 * 4, matrixOrder);

    view[20] = this.pixelSize;
    view[21] = this.halfWidth;
    view[22] = this.halfHeight;
    view[23] = this.aperture;
    view[24] = this.focalDistance;
    u32view[25] = this.maxDepth;
    u32view[26] = this.width;
    return buffer;
  }

  private sampleApertureOrigins(): Vector4[] {
    const baseOffset = -this.aperture / 2.0;
    const uvStep = this.aperture / 9;

    return this.uvSampleConfig
      .slice(0, this.maxFocalSamples)
      .map((s) => this.getSemiRandomPoint(s.u, s.v, uvStep, baseOffset));
  }

  private getSemiRandomPoint(
    u: number,
    v: number,
    uvStep: number,
    baseOffset: number
  ): Vector4 {
    return point(
      this.origin.x + baseOffset + (u + Math.random()) * uvStep,
      this.origin.y + baseOffset + (v + Math.random()) * uvStep,
      this.origin.z
    );
  }

  private initUvSampleConfig() {
    // prettier-ignore
    return [
      1, 7, 4, 8, 2, 8, 4, 7, 1,
      7, 5, 9, 6, 7, 6, 9, 5, 7,
      4, 9, 3, 8, 5, 8, 3, 9, 4,
      8, 6, 8, 6, 7, 6, 8, 6, 8,
      2, 7, 5, 7, 0, 7, 5, 7, 2,
      8, 6, 8, 6, 7, 6, 8, 6, 8,
      4, 9, 3, 8, 5, 8, 3, 9, 4,
      7, 5, 9, 6, 7, 6, 9, 5, 7,
      1, 7, 4, 8, 2, 8, 4, 7, 1,
    ]
      .map((val, idx) => {
        return { pass: val, u: Math.floor(idx / 9), v: idx % 9 };
      })
      .sort((a, b) => a.pass - b.pass);
  }
}
