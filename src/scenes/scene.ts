import { Camera } from '../lib/camera';
import { RenderConfiguration } from '../renderer/configuration';
import { World } from '../lib/world';
import {
  CameraConfiguration,
  ColorDefinition,
  LightConfiguration,
  MaterialDefinition,
  PatternDefinition,
  SceneDefinition,
  ShapeDefinition,
  ShapePrimitiveDefinition,
  Transform,
  Vec3,
  WorldDefinition,
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
import { Color, colorFromHex } from '../lib/math/color';
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
import { Group } from '../lib/shapes/group';
import { CsgShape } from '../lib/shapes/csg-shape';

export type SceneMode = 'sceneDefinition' | 'scenePreset';
export class Scene {
  protected world: World;
  private camera: Camera;

  constructor(
    private definiton: SceneDefinition,
    renderCfg: RenderConfiguration
  ) {
    this.world = this.initWorld(definiton.world, renderCfg);
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
    world: WorldDefinition,
    renderCfg: RenderConfiguration
  ): World {
    const w = new World();

    if (world.lights) {
      const [lights, objects] = this.createLights(world.lights, renderCfg);
      w.lights.push(...lights);
      w.objects.push(...objects);
    }

    if (world.objects) {
      w.objects.push(...world.objects.map((x) => this.createShape(x)));
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
          this.createColor(l.intensity)
        );

        lights.push(light);
      } else if (l.type === 'area') {
        const light = new AreaLight(
          this.createColor(l.intensity),
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

  private createShapePrimitive(
    primitive: ShapePrimitiveDefinition | string
  ): Shape {
    if (typeof primitive === 'string') {
      if (!this.definiton.shapes) {
        throw new Error('No shapes defined');
      }
      return this.createShapePrimitive(this.definiton.shapes[primitive]);
    }

    switch (primitive.type) {
      case 'sphere':
        return new Sphere();
      case 'plane':
        return new Plane();
      case 'cube':
        return new Cube();
      case 'cylinder':
        const cyl = new Cylinder();
        cyl.minimum = primitive.minimum ?? cyl.minimum;
        cyl.maximum = primitive.maximum ?? cyl.maximum;
        cyl.closed = primitive.closed ?? cyl.closed;
        return cyl;
      case 'cone':
        const cone = new Cone();
        cone.minimum = primitive.minimum ?? cone.minimum;
        cone.maximum = primitive.maximum ?? cone.maximum;
        cone.closed = primitive.closed ?? cone.closed;
        return cone;
      case 'triangle':
        throw new Error('Triangle not supported');
      case 'smooth-triangle':
        throw new Error('Smooth triangle not supported');
      case 'group':
        const group = new Group();
        primitive.shapes.forEach((c) => group.add(this.createShape(c)));
        return group;
      case 'csg':
        return new CsgShape(
          primitive.operation,
          this.createShape(primitive.left),
          this.createShape(primitive.right)
        );
    }
  }

  private createShape(s: ShapeDefinition): Shape {
    const obj = this.createShapePrimitive(s.primitive);
    if (s.material) {
      this.setMaterial(this.createMaterial(s.material), obj);
    }
    if (s.transform) {
      obj.transform = this.createTransformMatrix(s.transform);
    }
    return obj;
  }

  private setMaterial(material: Material, shape: Shape): void {
    if (shape instanceof Group) {
      shape.shapes.forEach((x) => this.setMaterial(material, x));
    } else if (shape instanceof CsgShape) {
      this.setMaterial(material, shape.left);
      this.setMaterial(material, shape.right);
    } else {
      shape.material = material;
    }
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

  private createMaterial(m?: MaterialDefinition | string): Material {
    const mat = material();
    if (!m) {
      return mat;
    }
    if (typeof m === 'string') {
      if (!this.definiton.materials) {
        return mat;
      }
      return this.createMaterial(this.definiton.materials[m]);
    }

    mat.color = this.createColor(m.color) ?? mat.color;
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

  private createPattern(p?: PatternDefinition | string): Pattern | null {
    if (!p) {
      return null;
    }
    if (typeof p === 'string') {
      if (!this.definiton.patterns) {
        return null;
      }
      return this.createPattern(this.definiton.patterns[p]);
    }

    let pattern: Pattern | null;
    switch (p.type) {
      case 'solid':
        pattern = new SolidPattern(this.createColor(p.color1));
        break;
      case 'stripe':
        pattern = new StripePattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'gradient':
        pattern = new GradientPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'ring':
        pattern = new RingPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'radial-gradient':
        pattern = new RadialGradientPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'checkers':
        pattern = new Checkers3dPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
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

    if (pattern && p.transform) {
      pattern.transform = this.createTransformMatrix(p.transform);
    }
    return pattern;
  }

  private createColor(def?: ColorDefinition | string): Color {
    if (!def) {
      return new Color(1, 1, 1);
    }
    if (typeof def === 'string') {
      if (def.startsWith('#')) {
        try {
          return colorFromHex(def);
        } catch (e) {
          console.error(e);
          return new Color(1, 1, 1);
        }
      }
      if (!this.definiton.colors) {
        return new Color(1, 1, 1);
      }
      return this.createColor(this.definiton.colors[def]);
    }

    return new Color(...def);
  }
}
