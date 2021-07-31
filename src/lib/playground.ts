import { point, vector, color } from './tuples';
import { radians, rotationX, rotationY, scaling, translation, viewTransform } from './transformations';
import { multiply } from './matrices';
import { Plane, Sphere } from './shapes';
import { pointLight } from './lights';
import { World } from './world';
import { Camera } from './camera';
import { BlendedPatterns, Checkers3dPattern, GradientPattern, RadialGradientPattern, RingPattern, StripePattern } from './patterns';
import { material } from './materials';


export function renderSpheres(width: number, height: number): ImageData {
    const startTime = Date.now();
    console.log(`renderSpheres(${ width }X${ height }) started..`);

    const floor = new Plane();
    floor.material.pattern = new Checkers3dPattern(color(0.9, 1, 0.9), color(0.1, 0.4, 0.1));
    floor.material.pattern.transform = multiply(translation(0, 0.5, 0), rotationY(radians(-45)));
    floor.material.specular = 0;
    floor.material.reflective = 0.3;

    const ceiling = new Plane();
    ceiling.transform = translation(0, 10.01, 0);
    ceiling.material = floor.material;

    const blendedPattern1 = new StripePattern(color(0.3, 0.5, 0.3), color(0.7, 1, 0.7));
    blendedPattern1.transform = rotationY(radians(90));
    const blendedPattern2 = new StripePattern(color(0.3, 0.5, 0.3), color(0.7, 1, 0.7));
    const wallMaterial = material()
    wallMaterial.pattern = new BlendedPatterns(blendedPattern1, blendedPattern2);
    wallMaterial.diffuse = 0.4;
    wallMaterial.specular = 0;

    const leftWall = new Plane();
    leftWall.transform = multiply(translation(0, 0, 15), multiply(rotationY(radians(-45)), rotationX(radians(90))));
    leftWall.material = wallMaterial;

    const leftHiddenWall = new Plane();
    leftHiddenWall.transform = multiply(translation(0, 0, -15), multiply(rotationY(radians(45)), rotationX(radians(90))));
    leftHiddenWall.material = wallMaterial;

    const rightWall = new Plane();
    rightWall.transform = multiply(translation(0, 0, 15), multiply(rotationY(radians(45)), rotationX(radians(90))));
    rightWall.material = wallMaterial;

    const rightHiddenWall = new Plane();
    rightHiddenWall.transform = multiply(translation(0, 0, -15), multiply(rotationY(radians(-45)), rotationX(radians(90))));
    rightHiddenWall.material = wallMaterial;

    const leftSmall = new Sphere();
    leftSmall.transform = multiply(translation(-1.6, 0.25, -1), scaling(0.25, 0.25, 0.25));
    leftSmall.material.color = color(1, 0.52, 0.72);

    const left = new Sphere();
    left.transform = multiply(translation(-1.3, 0.5, 0.1), scaling(0.5, 0.5, 0.5));
    left.material.pattern = new RingPattern(color(0.1, 0.5, 1), color(0.4, 0.7, 1));
    left.material.pattern.transform = multiply(scaling(0.15, 0.15, 0.15), multiply(rotationY(radians(30)), rotationX(radians(105))));
    left.material.diffuse = 0.7;
    left.material.specular = 0.3;

    const middleBehind = new Sphere();
    middleBehind.transform = translation(-1.2, 1, 2.5);
    middleBehind.material.pattern = new RadialGradientPattern(color(1, 1, 0), color(0, 1, 0));
    middleBehind.material.pattern.transform = multiply(scaling(0.25, 0.25, 0.25), multiply(rotationY(radians(-25)), rotationX(radians(80))));
    middleBehind.material.diffuse = 0.7;
    middleBehind.material.specular = 0.3;

    const middle = new Sphere();
    middle.transform = translation(0.7, 1, 1.0);
    middle.material.color = color(0.2, 0.2, 0.2);
    middle.material.reflective = 0.9;
    middle.material.specular = 1;
    middle.material.shininess = 400;

    const front = new Sphere();
    front.transform = multiply(translation(-0.3, 0.5, -1.2), scaling(0.5, 0.5, 0.5));
    front.material.color = color(0, 0, 0.4);
    front.material.transparancy = 1;
    front.material.refractiveIndex = 1.5;


    const right = new Sphere();
    right.transform = multiply(translation(1.5, 0.5, -0.5), scaling(0.5, 0.5, 0.5));
    right.material.pattern = new GradientPattern(color(1, 0, 1), color(0.3, 0, 1));
    right.material.pattern.transform = multiply(scaling(2, 1, 1), translation(0.5, 0, 0));
    right.material.diffuse = 0.7;
    right.material.specular = 0.3;

    const world = new World()
    world.lights.push(
        pointLight(point(-7.5, 10, -5), color(0.9, 0.9, 0.9)),
        // pointLight(point(-7.5, 10, 0), color(0.7, 0.7, 0.7))
    );
    world.objects.push(floor, ceiling, leftWall, leftHiddenWall, rightWall, rightHiddenWall, leftSmall, left, middle, middleBehind, front, right);

    const camera = new Camera(width, height, Math.PI / 3);
    camera.transform = viewTransform(point(0, 1.5, -5), point(0, 1, 0), vector(0, 1, 0));
    const canvas = camera.render(world);

    console.log(`   --render time: ${ (Date.now() - startTime) / 1000 } s`);
    return canvas.getImageData();
}