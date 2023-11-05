import { Camera } from '../lib/camera';
import { RenderConfiguration } from '../renderer/configuration';
import { World } from '../lib/world';
import {
  CameraConfiguration,
  SceneDefinition,
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
import { AreaLight, PointLight } from '../lib/lights';
import { Color } from '../lib/math/color';
import { Shape } from '../lib/shapes/shape';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Plane } from '../lib/shapes/primitives/plane';
import { Matrix4 } from '../lib/math/matrices';

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
      def.lights.forEach((l) => {
        if (l.type === 'point') {
          const light = new PointLight(
            point(...l.position),
            new Color(...l.intensity)
          );
          w.lights.push(light);
        } else if (l.type === 'area') {
          const light = new AreaLight(
            new Color(...l.intensity),
            renderCfg.maxLightSamples,
            renderCfg.adaptiveLightSamplingSensitivity
          );
          light.transform = this.getTransformMatrix(l.transform);
          w.lights.push(light);
          w.objects.push(light);
        }
      });
    }

    if (def.objects) {
      def.objects.forEach((o) => {
        let obj: Shape | null = null;
        if (o.type === 'sphere') {
          obj = new Sphere();
        } else if (o.type === 'plane') {
          obj = new Plane();
        } else {
          console.error('Unsupported object type: ', o.type);
          return;
        }

        if (o.material?.color) {
          obj.material.color = new Color(...o.material?.color);
        }
        if (o.material?.pattern) {
          console.error('Patterns are not supported yet.');
        }

        obj.material.ambient = o.material?.ambient ?? obj.material.ambient;
        obj.material.diffuse = o.material?.diffuse ?? obj.material.diffuse;
        obj.material.specular = o.material?.specular ?? obj.material.specular;
        obj.material.shininess =
          o.material?.shininess ?? obj.material.shininess;
        obj.material.reflective =
          o.material?.reflective ?? obj.material.reflective;
        obj.material.transparency =
          o.material?.transparency ?? obj.material.transparency;
        obj.material.refractiveIndex =
          o.material?.refractiveIndex ?? obj.material.refractiveIndex;

        if (o.transform) {
          obj.transform = this.getTransformMatrix(o.transform);
        }

        w.objects.push(obj);
      });
    }

    this.world = w;
    return w;
  }

  private getTransformMatrix(transformations: Transform[]): Matrix4 {
    const m = new Matrix4();
    for (let t of transformations) {
      if (t[0] === 'translate') {
        m.multiply(translation(t[1], t[2], t[3]));
      } else if (t[0] === 'scale') {
        m.multiply(scaling(t[1], t[2], t[3]));
      } else if (t[0] === 'rotateX') {
        m.multiply(rotationX(t[1]));
      } else if (t[0] === 'rotateY') {
        m.multiply(rotationY(t[1]));
      } else if (t[0] === 'rotateZ') {
        m.multiply(rotationZ(t[1]));
      } else if (t[0] === 'shear') {
        m.multiply(shearing(t[1], t[2], t[3], t[4], t[5], t[6]));
      }
    }
    return m;
  }
}
