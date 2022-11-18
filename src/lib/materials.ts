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
} from './tuples';
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
  lightIntensity: number
): Color {
  let mColor: Color;
  if (shape.material.pattern) {
    mColor = shape.material.pattern.colorAt(shape, point);
  } else {
    mColor = shape.material.color;
  }
  const effectiveColor = multiplyColors(mColor, light.intensity);
  const ambient = multiplyColorByScalar(effectiveColor, shape.material.ambient);

  if (lightIntensity === 0.0) {
    return ambient;
  }

  let sum = color(0, 0, 0);
  const specularLight = multiplyColorByScalar(
    light.intensity,
    shape.material.specular
  );
  const lightSamples = light.samplePoints();

  lightSamples.forEach((lightSample) => {
    const lightv = normalize(subtract(lightSample, point));
    let diffuse: Color, specular: Color;
    const lightDotNormal = dot(lightv, normalv);

    if (lightDotNormal < 0) {
      diffuse = color(0, 0, 0);
      specular = color(0, 0, 0);
    } else {
      diffuse = multiplyColorByScalar(
        multiplyColorByScalar(effectiveColor, shape.material.diffuse),
        lightDotNormal
      );

      const reflectv = reflect(negate(lightv), normalv);
      const reflectDotEye = dot(reflectv, eyev);
      if (reflectDotEye <= 0) {
        specular = color(0, 0, 0);
      } else {
        specular = multiplyColorByScalar(
          specularLight,
          Math.pow(reflectDotEye, shape.material.shininess)
        );
      }
    }
    sum = addColors(addColors(sum, diffuse), specular);
  });

  return addColors(
    ambient,
    multiplyColorByScalar(divideColor(sum, lightSamples.length), lightIntensity)
  );
}
