import {
  hit,
  prepareComputations,
  reflectance,
  refractedDirection,
} from './intersections';
import { materialColorAt } from './materials';
import { ray } from './rays';
import { addColors, blendColors, Color, Tuple, vector } from './math/tuples';
import { World } from './world';

export type Photon = {
  position: Tuple;
  direction: Tuple;
  power: Color;
  interactedWithSpecular: boolean;
};

export type PhotonMapResult = {
  globalMap: Photon[];
  causticMap: Photon[];
};

export class PhotonMapper {
  totalLightIntensity: number;
  photonPowerFactor: number;

  constructor(
    public world: World,
    public totalPhotons: number,
    public maxBounces: number = 4
  ) {
    this.totalLightIntensity = world.lights
      .map((l) => l.intensity)
      .reduce((a, b) => addColors(a, b))
      .reduce((a, b) => a + b);

    this.photonPowerFactor = this.totalLightIntensity / totalPhotons;
  }

  calculatePhotonMaps(photonCount: number): PhotonMapResult {
    const result: PhotonMapResult = {
      globalMap: [],
      causticMap: [],
    };

    const photons = this.emitPhotons(photonCount);

    for (let i = 0; i < photonCount; i++) {
      this.trace(photons[i], result.globalMap, result.causticMap);
    }

    return result;
  }

  private trace(
    photon: Photon,
    globalMap: Photon[],
    causticMap: Photon[],
    bounces = 0
  ): void {
    if (bounces > this.maxBounces) {
      return;
    }

    const r = ray(photon.position, photon.direction);
    const xs = this.world.intersects(r);
    const i = hit(xs);

    if (i === null) {
      return;
    }
    const ic = prepareComputations(i, r, xs);

    const specularReflection = Math.max(
      i.object.material.reflective,
      i.object.material.transparancy
    );
    const diffuseReflection = Math.min(
      i.object.material.diffuse,
      1 - specularReflection
    );

    const interactionResult = Math.random();
    if (interactionResult < diffuseReflection) {
      if (bounces > 0) {
        const interaction: Photon = {
          position: ic.point,
          direction: photon.direction,
          power: photon.power,
          interactedWithSpecular: photon.interactedWithSpecular,
        };
        if (photon.interactedWithSpecular) {
          causticMap.push(interaction);
        } else {
          globalMap.push(interaction);
        }
      }

      this.trace(
        {
          position: ic.point,
          direction: vector(
            ic.normalv[0] * Math.random(),
            ic.normalv[1] * Math.random(),
            ic.normalv[2] * Math.random()
          ),
          power: blendColors(
            photon.power,
            materialColorAt(ic.object, ic.point)
          ),
          interactedWithSpecular: photon.interactedWithSpecular,
        },
        globalMap,
        causticMap,
        bounces + 1
      );
    } else if (interactionResult - diffuseReflection < specularReflection) {
      let reflect: boolean;

      if (
        ic.object.material.reflective > 0 &&
        ic.object.material.transparancy > 0
      ) {
        reflect =
          interactionResult - diffuseReflection <
          specularReflection * reflectance(ic);
      } else {
        reflect = ic.object.material.reflective > 0;
      }
      if (reflect) {
        this.trace(
          {
            position: ic.overPoint,
            direction: ic.reflectv,
            power: blendColors(
              photon.power,
              materialColorAt(ic.object, ic.point)
            ),
            interactedWithSpecular: true,
          },
          globalMap,
          causticMap,
          bounces + 1
        );
      } else {
        const dir = refractedDirection(ic);
        if (dir !== null) {
          this.trace(
            {
              position: ic.underPoint,
              direction: dir,
              power: blendColors(
                photon.power,
                materialColorAt(ic.object, ic.point)
              ),
              interactedWithSpecular: true,
            },
            globalMap,
            causticMap,
            bounces + 1
          );
        }
      }
    }
  }

  private emitPhotons(count: number): Photon[] {
    const photons: Photon[] = [];
    this.world.lights.forEach((l) => {
      const emitCount =
        (count * (l.intensity[0] + l.intensity[1] + l.intensity[2])) /
        this.totalLightIntensity;

      photons.push(...l.emitPhotons(emitCount, this.photonPowerFactor));
    });
    return photons;
  }
}
