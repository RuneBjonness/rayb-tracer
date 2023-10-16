import {
  addColors,
  color,
  Color,
  divideColor,
  dot,
  multiplyColorByScalar,
  multiplyColors,
  negate,
  normalize,
  reflect,
  subtract,
  Tuple,
} from './math/tuples';
import { Light } from './lights';
import { Pattern } from './patterns/patterns';
import { Shape } from './shapes/shape';

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
    color: color(1, 1, 1),
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
  point: Tuple,
  eyev: Tuple,
  normalv: Tuple,
  lightIntensity: number,
  indirectLightning: Color | null = null
): Color {
  const effectiveColor = multiplyColors(
    materialColorAt(shape, point),
    light.intensity
  );
  let ambient: Color;

  if (indirectLightning) {
    ambient = multiplyColors(
      effectiveColor,
      color(
        Math.max(shape.material.ambient, indirectLightning[0]),
        Math.max(shape.material.ambient, indirectLightning[1]),
        Math.max(shape.material.ambient, indirectLightning[2])
      )
    );
  } else {
    ambient = multiplyColorByScalar(effectiveColor, shape.material.ambient);
  }

  if (lightIntensity === 0.0) {
    return ambient;
  }

  const specularLight = multiplyColorByScalar(
    light.intensity,
    shape.material.specular
  );
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
  let avgSample = sumSamples;

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
        sumSamples = addColors(
          sumSamples,
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
      const newAvgSampleColor = divideColor(
        sumSamples,
        passStartingIndex + currentPassSampleCount
      );

      if (
        Math.abs(avgSample[0] - newAvgSampleColor[0]) <=
          light.adaptiveSampleSensitivity &&
        Math.abs(avgSample[1] - newAvgSampleColor[1]) <=
          light.adaptiveSampleSensitivity &&
        Math.abs(avgSample[1] - newAvgSampleColor[1]) <=
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

  return addColors(ambient, multiplyColorByScalar(avgSample, lightIntensity));
}

export function materialColorAt(shape: Shape, point: Tuple): Color {
  return shape.material.pattern
    ? shape.material.pattern.colorAt(shape, point)
    : shape.material.color;
}

function lightingSample(
  lightSample: Tuple,
  point: Tuple,
  eyev: Tuple,
  normalv: Tuple,
  material: Material,
  effectiveColor: Color,
  specularLight: Color
): Color {
  const lightv = normalize(subtract(lightSample, point));
  let diffuse: Color, specular: Color;
  const lightDotNormal = dot(lightv, normalv);

  if (lightDotNormal < 0) {
    diffuse = color(0, 0, 0);
    specular = color(0, 0, 0);
  } else {
    diffuse = multiplyColorByScalar(
      multiplyColorByScalar(effectiveColor, material.diffuse),
      lightDotNormal
    );

    const reflectv = reflect(negate(lightv), normalv);
    const reflectDotEye = dot(reflectv, eyev);
    if (reflectDotEye <= 0) {
      specular = color(0, 0, 0);
    } else {
      specular = multiplyColorByScalar(
        specularLight,
        Math.pow(reflectDotEye, material.shininess)
      );
    }
  }
  return addColors(diffuse, specular);
}
