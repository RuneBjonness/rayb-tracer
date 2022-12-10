import { add, Color, divide, multiplyTupleByScalar, Tuple } from './tuples';
import { World } from './world';

export interface Light {
  intensity: Color;
  intensityAt(p: Tuple, w: World): number;
  samplePoints(): Tuple[];
  samplePassCounts: number[];
  maxSamples: number;
  adaptiveSampleSensitivity: number;
}

export class PointLight implements Light {
  public samplePassCounts = [1];
  public maxSamples = 1;
  public adaptiveSampleSensitivity = 1;

  constructor(private position: Tuple, public intensity: Color) {}

  samplePoints(): Tuple[] {
    return [this.position];
  }

  intensityAt(p: Tuple, w: World): number {
    return w.isShadowed(p, this.samplePoints()[0]) ? 0.0 : 1.0;
  }
}

export class AreaLight implements Light {
  public samplePassCounts = new Array<number>(7);

  private uVec: Tuple;
  private vVec: Tuple;
  private uvSampleConfig = this.initUvSampleConfig();

  constructor(
    private corner: Tuple,
    fullUvec: Tuple,
    fullVvec: Tuple,
    public intensity: Color,
    public maxSamples: number,
    public adaptiveSampleSensitivity: number
  ) {
    this.uVec = divide(fullUvec, 7);
    this.vVec = divide(fullVvec, 7);

    for (let i = 0; i < this.samplePassCounts.length; i++) {
      this.samplePassCounts[i] = this.uvSampleConfig.filter(
        (cfg) => cfg.pass === i
      ).length;
    }
  }

  samplePoints(): Tuple[] {
    if (this.maxSamples === 1) {
      return [this.pointOnLight(3, 3, false)];
    }

    return this.uvSampleConfig
      .slice(0, this.maxSamples)
      .map((s) => this.pointOnLight(s.u, s.v));
  }

  intensityAt(p: Tuple, w: World): number {
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

  private pointOnLight(u: number, v: number, applyNoise = true): Tuple {
    return add(
      this.corner,
      add(
        multiplyTupleByScalar(
          this.uVec,
          u + (applyNoise ? Math.random() : 0.5)
        ),
        multiplyTupleByScalar(this.vVec, v + (applyNoise ? Math.random() : 0.5))
      )
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
