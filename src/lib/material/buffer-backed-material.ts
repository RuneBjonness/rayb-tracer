import { BufferBackedLight } from '../lights/buffer-backed-light';
import { Color } from '../math/color';
import { Vector4 } from '../math/vector4';
import { BufferBackedPattern } from './buffer-backed-pattern';
import { MATERIAL_BYTE_SIZE } from './materials-buffer';

export class BufferBackedMaterial {
  readonly listLength: number;
  listIndex: number;
  float32View: Float32Array;
  int32View: Int32Array;
  pattern: BufferBackedPattern;

  constructor(
    materialsBuffer: ArrayBufferLike,
    patternsBuffer: ArrayBufferLike
  ) {
    this.listIndex = -1;
    this.listLength = materialsBuffer.byteLength / MATERIAL_BYTE_SIZE;
    this.float32View = new Float32Array(materialsBuffer);
    this.int32View = new Int32Array(materialsBuffer);

    this.pattern = new BufferBackedPattern(patternsBuffer);
  }

  get color(): Color {
    return new Color(
      this.float32View[this.listIndex * 12 + 0],
      this.float32View[this.listIndex * 12 + 1],
      this.float32View[this.listIndex * 12 + 2]
    );
  }

  get patternIdx(): number {
    return this.int32View[this.listIndex * 12 + 3];
  }

  get ambient(): number {
    return this.float32View[this.listIndex * 12 + 4];
  }

  get diffuse(): number {
    return this.float32View[this.listIndex * 12 + 5];
  }

  get specular(): number {
    return this.float32View[this.listIndex * 12 + 6];
  }

  get shininess(): number {
    return this.float32View[this.listIndex * 12 + 7];
  }

  get reflective(): number {
    return this.float32View[this.listIndex * 12 + 8];
  }

  get transparency(): number {
    return this.float32View[this.listIndex * 12 + 9];
  }

  get refractiveIndex(): number {
    return this.float32View[this.listIndex * 12 + 10];
  }

  colorAt(p: Vector4): Color {
    if (this.patternIdx === 0) {
      return this.color.clone();
    }
    this.pattern.listIndex = this.patternIdx;
    return this.pattern.colorAt(p);
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
