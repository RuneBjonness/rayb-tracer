import { Camera } from '../lib/camera';
import { RenderConfiguration } from '../renderer/configuration';
import { World } from '../lib/world';
import {
  CameraConfiguration,
  LightConfiguration,
  MaterialDefinition,
  PatternDefinition,
  SceneDefinition,
  ShapeDefinition,
  Transform,
} from './scene-definition';
import {
  radians,
  rotationX,
  rotationY,
  rotationZ,
  scaling,
  shearing,
  translation,
  viewTransform,
} from '../lib/math/transformations';
import { point, vector } from '../lib/math/vector4';
import { AreaLight, Light, PointLight } from '../lib/lights';
import { Color } from '../lib/math/color';
import { Shape } from '../lib/shapes/shape';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Plane } from '../lib/shapes/primitives/plane';
import { Matrix4 } from '../lib/math/matrices';
import {
  BlendedPatterns,
  Checkers3dPattern,
  GradientPattern,
  Pattern,
  RadialGradientPattern,
  RingPattern,
  SolidPattern,
  StripePattern,
} from '../lib/patterns/patterns';
import { Material, material } from '../lib/materials';
import { Cube } from '../lib/shapes/primitives/cube';
import { Cylinder } from '../lib/shapes/primitives/cylinder';
import { Cone } from '../lib/shapes/primitives/cone';

export type SceneMode = 'sceneDefinition' | 'scenePreset';
export class Scene {
  protected world: World;
  private camera: Camera;

  constructor(definiton: SceneDefinition, renderCfg: RenderConfiguration) {
    this.world = this.initWorld(definiton, renderCfg);
    this.camera = this.initCamera(definiton.camera, renderCfg);
  }

  public renderTile(x: number, y: number, w: number, h: number): ImageData {
    return this.camera.renderPart(this.world, x, y, w, h).getImageData();
  }

  private initCamera(
    cameraCfg: CameraConfiguration,
    renderCfg: RenderConfiguration
  ): Camera {
    const camera = new Camera(
      renderCfg.width,
      renderCfg.height,
      radians(cameraCfg.fieldOfView)
    );
    camera.aperture = renderCfg.forceZeroAperture ? 0 : cameraCfg.aperture;
    camera.focalDistance = cameraCfg.focalDistance;
    camera.maxFocalSamples = renderCfg.maxFocalSamples;
    camera.adaptiveSamplingColorSensitivity =
      renderCfg.adaptiveFocalSamplingSensitivity;
    camera.transform = viewTransform(
      point(...cameraCfg.viewTransform.from),
      point(...cameraCfg.viewTransform.to),
      vector(...cameraCfg.viewTransform.up)
    );
    camera.maxDepth = renderCfg.maxDepth;
    camera.maxIndirectLightSamples = renderCfg.maxIndirectLightSamples;
    this.camera = camera;
    return camera;
  }

  private initWorld(
    def: SceneDefinition,
    renderCfg: RenderConfiguration
  ): World {
    const w = new World();

    if (def.lights) {
      const [lights, objects] = this.createLights(def.lights, renderCfg);
      w.lights.push(...lights);
      w.objects.push(...objects);
    }

    if (def.objects) {
      w.objects.push(...def.objects.map((x) => this.createShape(x)));
    }

    this.world = w;
    return w;
  }

  private createLights(
    lightCfgs: LightConfiguration[],
    renderCfg: RenderConfiguration
  ): [Light[], Shape[]] {
    const lights: Light[] = [];
    const objects: Shape[] = [];

    lightCfgs.forEach((l) => {
      if (l.type === 'point') {
        const light = new PointLight(
          point(...l.position),
          new Color(...l.intensity)
        );

        lights.push(light);
      } else if (l.type === 'area') {
        const light = new AreaLight(
          new Color(...l.intensity),
          renderCfg.maxLightSamples,
          renderCfg.adaptiveLightSamplingSensitivity
        );
        light.transform = this.createTransformMatrix(l.transform);

        lights.push(light);
        if (l.includeGeometry) {
          objects.push(light);
        }
      }
    });

    return [lights, objects];
  }

  private createShape(s: ShapeDefinition): Shape {
    let obj: Shape | null = null;
    if (s.type === 'sphere') {
      obj = new Sphere();
    } else if (s.type === 'plane') {
      obj = new Plane();
    } else if (s.type === 'cube') {
      obj = new Cube();
    } else if (s.type === 'cylinder') {
      const cyl = new Cylinder();
      cyl.minimum = s.minimum;
      cyl.maximum = s.maximum;
      cyl.closed = s.closed;
      obj = cyl;
    } else if (s.type === 'cone') {
      const cone = new Cone();
      cone.minimum = s.minimum;
      cone.maximum = s.maximum;
      cone.closed = s.closed;
      obj = cone;
    } else {
      throw new Error('Unsupported object type: ' + s.type);
    }

    if (s.material) {
      obj.material = this.createMaterial(s.material);
    }

    if (s.transform) {
      obj.transform = this.createTransformMatrix(s.transform);
    }

    return obj;
  }

  private createTransformMatrix(transformations: Transform[]): Matrix4 {
    const m = new Matrix4();
    for (let t of transformations) {
      if (t[0] === 'translate') {
        m.multiply(translation(t[1], t[2], t[3]));
      } else if (t[0] === 'scale') {
        m.multiply(scaling(t[1], t[2], t[3]));
      } else if (t[0] === 'rotateX') {
        m.multiply(rotationX(radians(t[1])));
      } else if (t[0] === 'rotateY') {
        m.multiply(rotationY(radians(t[1])));
      } else if (t[0] === 'rotateZ') {
        m.multiply(rotationZ(radians(t[1])));
      } else if (t[0] === 'shear') {
        m.multiply(shearing(t[1], t[2], t[3], t[4], t[5], t[6]));
      }
    }
    return m;
  }

  private createMaterial(m: MaterialDefinition): Material {
    const mat = material();
    mat.color = m.color ? new Color(...m.color) : mat.color;
    mat.pattern = m.pattern ? this.createPattern(m.pattern) : mat.pattern;
    mat.ambient = m.ambient ?? mat.ambient;
    mat.diffuse = m.diffuse ?? mat.diffuse;
    mat.specular = m.specular ?? mat.specular;
    mat.shininess = m.shininess ?? mat.shininess;
    mat.reflective = m.reflective ?? mat.reflective;
    mat.transparency = m.transparency ?? mat.transparency;
    mat.refractiveIndex = m.refractiveIndex ?? mat.refractiveIndex;
    return mat;
  }

  private createPattern(p: PatternDefinition): Pattern | null {
    let pattern: Pattern | null;
    switch (p.type) {
      case 'solid':
        pattern = new SolidPattern(new Color(...p.color1));
        break;
      case 'stripe':
        pattern = new StripePattern(
          new Color(...p.color1),
          new Color(...p.color2)
        );
        break;
      case 'gradient':
        pattern = new GradientPattern(
          new Color(...p.color1),
          new Color(...p.color2)
        );
        break;
      case 'ring':
        pattern = new RingPattern(
          new Color(...p.color1),
          new Color(...p.color2)
        );
        break;
      case 'radial-gradient':
        pattern = new RadialGradientPattern(
          new Color(...p.color1),
          new Color(...p.color2)
        );
        break;
      case 'checkers':
        pattern = new Checkers3dPattern(
          new Color(...p.color1),
          new Color(...p.color2)
        );
        break;
      case 'blended':
        const p1 = this.createPattern(p.pattern1);
        const p2 = this.createPattern(p.pattern2);
        if (p1 && p2) {
          pattern = new BlendedPatterns(p1, p2);
        } else {
          pattern = null;
        }
        break;
      default:
        pattern = null;
    }
    if (pattern) {
      pattern.transform = this.createTransformMatrix(p.transform);
    }
    return pattern;
  }
}
