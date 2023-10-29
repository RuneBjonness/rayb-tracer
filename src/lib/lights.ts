import { Matrix4 } from './math/matrices';
import { Photon } from './photon-mapper';
import { Cube } from './shapes/primitives/cube';
import { scaling } from './math/transformations';
import { World } from './world';
import { Color } from './math/color';
import { Vector4, point, vector } from './math/vector4';

export interface Light {
  intensity: Color;
  samplePassCounts: number[];
  maxSamples: number;
  adaptiveSampleSensitivity: number;

  intensityAt(p: Vector4, w: World): number;
  samplePoints(): Vector4[];
  emitPhotons(count: number, powerFactor: number): Photon[];
}

export class PointLight implements Light {
  public samplePassCounts = [1];
  public maxSamples = 1;
  public adaptiveSampleSensitivity = 1;

  constructor(private position: Vector4, public intensity: Color) {}

  samplePoints(): Vector4[] {
    return [this.position];
  }

  intensityAt(p: Vector4, w: World): number {
    return w.isShadowed(p, this.samplePoints()[0]) ? 0.0 : 1.0;
  }

  emitPhotons(count: number, powerFactor: number): Photon[] {
    const photons = new Array<Photon>(count);
    for (let i = 0; i < count; i++) {
      photons[i] = {
        position: this.position,
        direction: vector(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ),
        interactedWithSpecular: false,
        power: this.intensity.clone().multiplyByScalar(powerFactor),
      };
    }
    return photons;
  }
}

export class AreaLight extends Cube implements Light {
  public get transform() {
    return super.transform;
  }
  public set transform(m: Matrix4) {
    super.transform = m.multiply(scaling(1, 0.0001, 1));
  }

  public samplePassCounts = new Array<number>(7);

  private corner: Vector4;
  private uVec: Vector4;
  private vVec: Vector4;
  private uvSampleConfig = this.initUvSampleConfig();

  constructor(
    public intensity: Color,
    public maxSamples: number,
    public adaptiveSampleSensitivity: number
  ) {
    super();
    this.transform = new Matrix4();

    this.material.color = intensity;
    this.material.diffuse = 0;
    this.material.specular = 0;
    this.material.ambient = 1;

    this.corner = point(-1, -1.001, -1);
    this.uVec = vector(2, 0, 0).divide(7);
    this.vVec = vector(0, 0, 2).divide(7);

    for (let i = 0; i < this.samplePassCounts.length; i++) {
      this.samplePassCounts[i] = this.uvSampleConfig.filter(
        (cfg) => cfg.pass === i
      ).length;
    }
  }

  samplePoints(): Vector4[] {
    if (this.maxSamples === 1) {
      return [this.pointOnLight(3, 3, false)];
    }

    return this.uvSampleConfig
      .slice(0, this.maxSamples)
      .map((s) => this.pointOnLight(s.u, s.v));
  }

  intensityAt(p: Vector4, w: World): number {
    if (this.maxSamples === 1) {
      return w.isShadowed(p, this.pointOnLight(3, 3, false)) ? 0.0 : 1.0;
    }

    const samples = this.samplePoints();
    let sumSampleIntensity = w.isShadowed(p, samples[0]) ? 0.0 : 1.0;
    let avgSampleIntensity = sumSampleIntensity;
    let passStartingIndex = 1;

    for (let pass = 1; pass < 7; pass++) {
      const currentPassSampleCount = Math.min(
        this.samplePassCounts[pass],
        samples.length - passStartingIndex
      );

      for (
        let pi = passStartingIndex;
        pi < passStartingIndex + currentPassSampleCount;
        pi++
      ) {
        if (!w.isShadowed(p, samples[pi])) {
          sumSampleIntensity += 1.0;
        }
      }
      const newAvgSampleIntensity =
        sumSampleIntensity / (passStartingIndex + currentPassSampleCount);

      if (
        Math.abs(avgSampleIntensity - newAvgSampleIntensity) <=
        this.adaptiveSampleSensitivity
      ) {
        avgSampleIntensity = newAvgSampleIntensity;
        break;
      }
      avgSampleIntensity = newAvgSampleIntensity;
      passStartingIndex += currentPassSampleCount;

      if (passStartingIndex >= samples.length) {
        break;
      }
    }
    return avgSampleIntensity;
  }

  emitPhotons(count: number, powerFactor: number): Photon[] {
    const photons = new Array<Photon>(count);
    for (let i = 0; i < count; i++) {
      let samplePos = this.uvSampleConfig[i % this.uvSampleConfig.length];
      photons[i] = {
        position: this.pointOnLight(samplePos.u, samplePos.v),
        direction: vector(
          Math.random() * 2 - 1,
          -Math.random(),
          Math.random() * 2 - 1
        ),
        interactedWithSpecular: false,
        power: this.intensity.clone().multiplyByScalar(powerFactor),
      };
    }
    return photons;
  }

  private pointOnLight(u: number, v: number, applyNoise = true): Vector4 {
    return this.pointToWorld(
      this.corner
        .clone()
        .add(this.uVec.clone().scale(u + (applyNoise ? Math.random() : 0.5)))
        .add(this.vVec.clone().scale(v + (applyNoise ? Math.random() : 0.5)))
    );
  }

  private initUvSampleConfig() {
    // prettier-ignore
    return [
      1, 4, 5, 2, 5, 4, 1,
      4, 3, 6, 3, 6, 3, 4,
      5, 6, 4, 5, 4, 6, 5,
      2, 3, 5, 0, 5, 3, 2,
      5, 6, 4, 5, 4, 6, 5,
      4, 3, 6, 3, 6, 3, 4,
      1, 4, 5, 2, 5, 4, 1,
    ]
      .map((val, idx) => {
        return { pass: val, u: Math.floor(idx / 7), v: idx % 7 };
      })
      .sort((a, b) => a.pass - b.pass);
  }
}
