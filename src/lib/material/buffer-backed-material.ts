import { BufferBackedLight } from '../lights/buffer-backed-light';
import { Color } from '../math/color';
import { Vector4 } from '../math/vector4';
import { MATERIAL_BYTE_SIZE } from './materials-buffer';

export class BufferBackedMaterial {
  color: Color;
  patternIdx: number;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  reflective: number;
  transparency: number;
  refractiveIndex: number;

  readonly listLength: number;
  private _listIndex: number;

  constructor(private buffer: ArrayBufferLike) {
    this._listIndex = -1;
    this.listLength = buffer.byteLength / MATERIAL_BYTE_SIZE;

    this.color = new Color(1, 1, 1);
    this.patternIdx = -1;
    this.ambient = 0.1;
    this.diffuse = 0.9;
    this.specular = 0.9;
    this.shininess = 200.0;
    this.reflective = 0;
    this.transparency = 0;
    this.refractiveIndex = 1;
  }

  get listIndex() {
    return this._listIndex;
  }

  set listIndex(index: number) {
    if (index === this._listIndex) {
      return;
    }

    this._listIndex = index;
    const float32View = new Float32Array(
      this.buffer,
      index * MATERIAL_BYTE_SIZE,
      MATERIAL_BYTE_SIZE / 4
    );
    const int32View = new Int32Array(
      this.buffer,
      index * MATERIAL_BYTE_SIZE,
      MATERIAL_BYTE_SIZE / 4
    );

    this.color.r = float32View[0];
    this.color.g = float32View[1];
    this.color.b = float32View[2];

    this.patternIdx = int32View[3];

    this.ambient = float32View[4];
    this.diffuse = float32View[5];
    this.specular = float32View[6];
    this.shininess = float32View[7];
    this.reflective = float32View[8];
    this.transparency = float32View[9];
    this.refractiveIndex = float32View[10];
  }

  colorAt(p: Vector4): Color {
    if (this.patternIdx === 0) {
      return this.color.clone();
    }

    return new Color(p.x, p.y, p.z);
  }
}

export function lighting(
  material: BufferBackedMaterial,
  light: BufferBackedLight,
  point: Vector4,
  eyev: Vector4,
  normalv: Vector4,
  lightIntensity: number
): Color {
  const effectiveColor = material.colorAt(point).multiply(light.intensity);
  const ambient = effectiveColor.clone().multiplyByScalar(material.ambient);

  if (lightIntensity === 0.0) {
    return ambient;
  }

  const specularLight = light.intensity
    .clone()
    .multiplyByScalar(material.specular);

  //const lightSamples = light.samplePoints();

  let sumSamples = lightingSample(
    light.position, //lightSamples[0],
    point,
    eyev,
    normalv,
    material,
    effectiveColor,
    specularLight
  );
  let avgSample = sumSamples.clone();

  // if (light.maxSamples > 1) {
  //   let passStartingIndex = 1;

  //   for (let p = 1; p < 7; p++) {
  //     const currentPassSampleCount = Math.min(
  //       light.samplePassCounts[p],
  //       lightSamples.length - passStartingIndex
  //     );

  //     for (
  //       let i = passStartingIndex;
  //       i < passStartingIndex + currentPassSampleCount;
  //       i++
  //     ) {
  //       sumSamples.add(
  //         lightingSample(
  //           lightSamples[i],
  //           point,
  //           eyev,
  //           normalv,
  //           shape.material,
  //           effectiveColor,
  //           specularLight
  //         )
  //       );
  //     }
  //     const newAvgSampleColor = sumSamples
  //       .clone()
  //       .divideByScalar(passStartingIndex + currentPassSampleCount);

  //     if (
  //       Math.abs(avgSample.r - newAvgSampleColor.r) <=
  //         light.adaptiveSampleSensitivity &&
  //       Math.abs(avgSample.g - newAvgSampleColor.g) <=
  //         light.adaptiveSampleSensitivity &&
  //       Math.abs(avgSample.b - newAvgSampleColor.b) <=
  //         light.adaptiveSampleSensitivity
  //     ) {
  //       avgSample = newAvgSampleColor;
  //       break;
  //     }
  //     avgSample = newAvgSampleColor;
  //     passStartingIndex += currentPassSampleCount;

  //     if (passStartingIndex >= lightSamples.length) {
  //       break;
  //     }
  //   }
  // }

  return ambient.add(avgSample.multiplyByScalar(lightIntensity));
}

function lightingSample(
  lightSample: Vector4,
  point: Vector4,
  eyev: Vector4,
  normalv: Vector4,
  material: BufferBackedMaterial,
  effectiveColor: Color,
  specularLight: Color
): Color {
  const lightv = lightSample.clone().subtract(point).normalize();
  const lightDotNormal = lightv.dot(normalv);

  if (lightDotNormal < 0) {
    return new Color(0, 0, 0);
  }

  const diffuse = effectiveColor
    .clone()
    .multiplyByScalar(material.diffuse * lightDotNormal);

  const reflectDotEye = lightv.negate().reflect(normalv).dot(eyev);
  if (reflectDotEye <= 0) {
    return diffuse;
  }

  const specular = specularLight
    .clone()
    .multiplyByScalar(Math.pow(reflectDotEye, material.shininess));

  return diffuse.add(specular);
}
