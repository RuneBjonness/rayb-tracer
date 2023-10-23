import { Color } from './math/color';
import { Light } from './lights';
import { Pattern } from './patterns/patterns';
import { Shape } from './shapes/shape';
import { Vector4 } from './math/vector4';

export type Material = {
  color: Color;
  pattern: Pattern | null;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  reflective: number;
  transparancy: number;
  refractiveIndex: number;
};

export function material(): Material {
  return {
    color: new Color(1, 1, 1),
    pattern: null,
    ambient: 0.1,
    diffuse: 0.9,
    specular: 0.9,
    shininess: 200.0,
    reflective: 0,
    transparancy: 0,
    refractiveIndex: 1,
  };
}

export function lighting(
  shape: Shape,
  light: Light,
  point: Vector4,
  eyev: Vector4,
  normalv: Vector4,
  lightIntensity: number,
  indirectLightning: Color | null = null
): Color {
  const effectiveColor = materialColorAt(shape, point).multiply(
    light.intensity
  );
  let ambient = effectiveColor.clone();

  if (indirectLightning) {
    ambient.multiply(
      new Color(
        Math.max(shape.material.ambient, indirectLightning.r),
        Math.max(shape.material.ambient, indirectLightning.g),
        Math.max(shape.material.ambient, indirectLightning.b)
      )
    );
  } else {
    ambient.multiplyByScalar(shape.material.ambient);
  }

  if (lightIntensity === 0.0) {
    return ambient;
  }

  const specularLight = light.intensity
    .clone()
    .multiplyByScalar(shape.material.specular);
  const lightSamples = light.samplePoints();

  let sumSamples = lightingSample(
    lightSamples[0],
    point,
    eyev,
    normalv,
    shape.material,
    effectiveColor,
    specularLight
  );
  let avgSample = sumSamples.clone();

  if (light.maxSamples > 1) {
    let passStartingIndex = 1;

    for (let p = 1; p < 7; p++) {
      const currentPassSampleCount = Math.min(
        light.samplePassCounts[p],
        lightSamples.length - passStartingIndex
      );

      for (
        let i = passStartingIndex;
        i < passStartingIndex + currentPassSampleCount;
        i++
      ) {
        sumSamples.add(
          lightingSample(
            lightSamples[i],
            point,
            eyev,
            normalv,
            shape.material,
            effectiveColor,
            specularLight
          )
        );
      }
      const newAvgSampleColor = sumSamples
        .clone()
        .divideByScalar(passStartingIndex + currentPassSampleCount);

      if (
        Math.abs(avgSample.r - newAvgSampleColor.r) <=
          light.adaptiveSampleSensitivity &&
        Math.abs(avgSample.g - newAvgSampleColor.g) <=
          light.adaptiveSampleSensitivity &&
        Math.abs(avgSample.b - newAvgSampleColor.b) <=
          light.adaptiveSampleSensitivity
      ) {
        avgSample = newAvgSampleColor;
        break;
      }
      avgSample = newAvgSampleColor;
      passStartingIndex += currentPassSampleCount;

      if (passStartingIndex >= lightSamples.length) {
        break;
      }
    }
  }

  return ambient.add(avgSample.multiplyByScalar(lightIntensity));
}

export function materialColorAt(shape: Shape, point: Vector4): Color {
  return shape.material.pattern
    ? shape.material.pattern.colorAt(shape, point)
    : shape.material.color.clone();
}

function lightingSample(
  lightSample: Vector4,
  point: Vector4,
  eyev: Vector4,
  normalv: Vector4,
  material: Material,
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
