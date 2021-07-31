import { point, vector, color } from './tuples';
import { radians, rotationX, rotationY, scaling, translation, viewTransform } from './transformations';
import { multiply } from './matrices';
import { Plane, Sphere } from './shapes';
import { pointLight } from './lights';
import { World } from './world';
import { Camera } from './camera';
import { Checkers3dPattern, RadialGradientPattern, RingPattern, StripePattern } from './patterns';
import { material } from './materials';


export function renderSpheres(width: number, height: number): ImageData {
    const startTime = Date.now();
    console.log(`renderSpheres(${ width }X${ height }) started..`);

    const colorLightGreen = color(0.9, 1, 0.9);
    const colorDarkGreen = color(0.1, 0.4, 0.1);
    const floor = new Plane();
    floor.material.pattern = new Checkers3dPattern(colorLightGreen, colorDarkGreen);
    floor.material.pattern.transform = multiply(translation(0, 0.5, 0), rotationY(radians(-45)));
    floor.material.specular = 0.8;
    floor.material.reflective = 0.3;

    const ceiling = new Plane();
    ceiling.transform = translation(0, 5, 0);
    ceiling.material.color = colorDarkGreen;
    ceiling.material.ambient = 0.7;
    ceiling.material.specular = 0.8;
    ceiling.material.reflective = 0.1;

    const wallMaterial = material()
    wallMaterial.pattern = new StripePattern(colorLightGreen, colorDarkGreen);
    wallMaterial.reflective = 0.1;

    const leftWall = new Plane();
    leftWall.transform = multiply(translation(0, 0, 10), multiply(rotationY(radians(-45)), rotationX(radians(90))));
    leftWall.material = wallMaterial;

    const leftHiddenWall = new Plane();
    leftHiddenWall.transform = multiply(translation(0, 0, -10), multiply(rotationY(radians(45)), rotationX(radians(90))));
    leftHiddenWall.material = wallMaterial;

    const rightWall = new Plane();
    rightWall.transform = multiply(translation(0, 0, 10), multiply(rotationY(radians(45)), rotationX(radians(90))));
    rightWall.material = wallMaterial;

    const rightHiddenWall = new Plane();
    rightHiddenWall.transform = multiply(translation(0, 0, -10), multiply(rotationY(radians(-45)), rotationX(radians(90))));
    rightHiddenWall.material = wallMaterial;

    const left = new Sphere();
    left.transform = multiply(translation(-1.3, 0.5, 0.1), scaling(0.5, 0.5, 0.5));
    left.material.pattern = new RingPattern(color(0.1, 0.5, 1), color(0.4, 0.7, 1));
    left.material.pattern.transform = multiply(scaling(0.15, 0.15, 0.15), multiply(rotationY(radians(30)), rotationX(radians(105))));
    left.material.diffuse = 0.7;
    left.material.specular = 0.3;

    const middle = new Sphere();
    middle.transform = translation(0.7, 1, 1.0);
    middle.material.color = color(0.2, 0.2, 0.2);
    middle.material.reflective = 0.9;
    middle.material.specular = 1;
    middle.material.shininess = 400;


    const leftSmall = new Sphere();
    leftSmall.transform = multiply(translation(-1.4, 0.25, -1), scaling(0.25, 0.25, 0.25));
    leftSmall.material.color = color(0, 0.2, 0);
    leftSmall.material.reflective = 0.3;
    leftSmall.material.specular = 0.6;
    leftSmall.material.shininess = 100;

    const front = new Sphere();
    front.transform = multiply(translation(-0.3, 0.5, -1.2), scaling(0.5, 0.5, 0.5));
    front.material.color = color(0, 0, 0.3);
    front.material.reflective = 0.9;
    front.material.transparancy = 1;
    front.material.refractiveIndex = 1.5;

    const middleBehind = new Sphere();
    middleBehind.transform = multiply(translation(-1.2, 0.75, 2.5), scaling(0.75, 0.75, 0.75));
    middleBehind.material = front.material;

    const right = new Sphere();
    right.transform = multiply(translation(1.5, 0.5, -0.5), scaling(0.5, 0.5, 0.5));
    right.material.pattern = new RadialGradientPattern(color(1, 1, 0), color(0, 1, 0));
    right.material.pattern.transform = multiply(scaling(0.2, 0.2, 0.2), multiply(rotationY(radians(-10)), rotationX(radians(80))));
    right.material.diffuse = 0.7;
    right.material.specular = 0.3;

    const world = new World()
    world.lights.push(
        pointLight(point(-2.4, 3.5, -2.4), color(0.9, 0.9, 0.9)),
        // pointLight(point(2.5, 4.99, -2.5), color(0.3, 0.3, 0.3))
    );
    world.objects.push(floor, ceiling, leftWall, leftHiddenWall, rightWall, rightHiddenWall, front, leftSmall, left, middle, middleBehind, right);

    const camera = new Camera(width, height, Math.PI / 3);
    camera.transform = viewTransform(point(0, 1.5, -5), point(0, 1, 0), vector(0, 1, 0));
    const canvas = camera.render(world);

    console.log(`   --render time: ${ (Date.now() - startTime) / 1000 } s`);
    return canvas.getImageData();
}