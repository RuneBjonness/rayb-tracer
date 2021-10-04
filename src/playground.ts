import { point, vector, color, Color } from './lib/tuples';
import {
    radians,
    rotationX,
    rotationY,
    rotationZ,
    scaling,
    shearing,
    translation,
    viewTransform,
} from './lib/transformations';
import { multiply } from './lib/matrices';
import { Shape } from './lib/shapes/shape';
import { CsgShape } from './lib/shapes/csg-shape';
import { Group } from './lib/shapes/group';
import { AreaLight, PointLight } from './lib/lights';
import { World } from './lib/world';
import { Camera } from './lib/camera';
import {
    Checkers3dPattern,
    RadialGradientPattern,
    RingPattern,
    StripePattern,
} from './lib/patterns/patterns';
import { Material, material } from './lib/materials';
import { ObjParser } from './lib/obj-parser';
import icosahedronObjFile from './resources/icosahedron.obj?raw';
import teapotLowResObjFile from './resources/teapot-lowres.obj?raw';
import teapotObjFile from './resources/teapot.obj?raw';
import { Cone } from './lib/shapes/primitives/cone';
import { Cube } from './lib/shapes/primitives/cube';
import { Cylinder } from './lib/shapes/primitives/cylinder';
import { Plane } from './lib/shapes/primitives/plane';
import { Sphere } from './lib/shapes/primitives/sphere';
import { Triangle } from './lib/shapes/primitives/triangle';
import { TextureMap } from './lib/patterns/texture-mapping/texture-map';
import { CheckersUvPattern } from './lib/patterns/texture-mapping/uv-patterns';
import { SphericalMapper } from './lib/patterns/texture-mapping/uv-mappers';

export function configureWorld(): World {
    const rainbow = [
        color(1, 0, 0),
        color(0.8, 0, 0.6),
        color(0.6, 0, 0.6),
        color(0.4, 0, 0.6),
        color(0, 0.32, 0.83),
        color(0.04, 0.7, 0.76),
        color(0, 0.6, 0),
        color(0.4, 0.8, 0),
        color(1, 1, 0),
        color(1, 0.8, 0),
        color(1, 0.6, 0),
        color(1, 0.4, 0),
    ];

    function matteFloor(): Shape {
        const f = new Plane();
        f.material.specular = 0;
        f.material.ambient = 0.025;
        f.material.diffuse = 0.67;
        return f;
    }

    function reflectiveFloor(c: Color): Shape {
        const f = new Plane();
        f.material.color = c;
        f.material.specular = 0.8;
        f.material.reflective = 0.7;
        f.transform = translation(0, -0.5, 0);
        return f;
    }

    function checkeredFloor(c1: Color, c2: Color): Shape {
        const f = new Plane();
        f.material.pattern = new Checkers3dPattern(c1, c2);
        f.material.pattern.transform = multiply(
            translation(0, 0.5, 0),
            rotationY(radians(-45))
        );
        return f;
    }

    function checkeredRoom(c1: Color, c2: Color): Shape[] {
        const floor = new Plane();
        floor.material.pattern = new Checkers3dPattern(c1, c2);
        floor.material.pattern.transform = multiply(
            translation(0, 0.5, 0),
            rotationY(radians(-45))
        );
        floor.material.specular = 0.8;
        floor.material.reflective = 0.3;

        const ceiling = new Plane();
        ceiling.transform = translation(0, 5, 0);
        ceiling.material.color = c2;
        ceiling.material.ambient = 0.7;
        ceiling.material.specular = 0.8;
        ceiling.material.reflective = 0.1;

        const wallMaterial = material();
        wallMaterial.pattern = new StripePattern(c1, c2);
        wallMaterial.reflective = 0.1;

        const leftWall = new Plane();
        leftWall.transform = multiply(
            translation(0, 0, 10),
            multiply(rotationY(radians(-45)), rotationX(radians(90)))
        );
        leftWall.material = wallMaterial;

        const leftHiddenWall = new Plane();
        leftHiddenWall.transform = multiply(
            translation(0, 0, -10),
            multiply(rotationY(radians(45)), rotationX(radians(90)))
        );
        leftHiddenWall.material = wallMaterial;

        const rightWall = new Plane();
        rightWall.transform = multiply(
            translation(0, 0, 10),
            multiply(rotationY(radians(45)), rotationX(radians(90)))
        );
        rightWall.material = wallMaterial;

        const rightHiddenWall = new Plane();
        rightHiddenWall.transform = multiply(
            translation(0, 0, -10),
            multiply(rotationY(radians(-45)), rotationX(radians(90)))
        );
        rightHiddenWall.material = wallMaterial;

        return [
            floor,
            ceiling,
            leftWall,
            leftHiddenWall,
            rightWall,
            rightHiddenWall,
        ];
    }

    function basicShere(): Shape {
        const s = new Sphere();
        s.transform = translation(-1, 1, 0);
        s.material.color = color(0.5, 0, 1);
        s.material.diffuse = 0.6;
        s.material.specular = 0;
        s.material.ambient = 0.1;
        s.material.reflective = 0.3;
        return s;
    }

    function spheresDemo(): Shape[] {
        const left = new Sphere();
        left.transform = multiply(
            translation(-1.3, 0.5, 0.1),
            scaling(0.5, 0.5, 0.5)
        );
        left.material.pattern = new RingPattern(
            color(0.1, 0.5, 1),
            color(0.4, 0.7, 1)
        );
        left.material.pattern.transform = multiply(
            scaling(0.15, 0.15, 0.15),
            multiply(rotationY(radians(30)), rotationX(radians(105)))
        );
        left.material.diffuse = 0.7;
        left.material.specular = 0.3;

        const middle = new Sphere();
        middle.transform = translation(0.7, 1, 1.0);
        middle.material.color = color(0.2, 0.2, 0.2);
        middle.material.reflective = 0.9;
        middle.material.specular = 1;
        middle.material.shininess = 400;

        const leftSmall = new Sphere();
        leftSmall.transform = multiply(
            translation(-1.4, 0.25, -1),
            scaling(0.25, 0.25, 0.25)
        );
        leftSmall.material.color = color(0, 0.2, 0);
        leftSmall.material.reflective = 0.3;
        leftSmall.material.specular = 0.6;
        leftSmall.material.shininess = 100;

        const front = new Sphere();
        front.transform = multiply(
            translation(-0.3, 0.5, -1.2),
            scaling(0.5, 0.5, 0.5)
        );
        front.material.color = color(0, 0, 0.3);
        front.material.reflective = 0.9;
        front.material.transparancy = 1;
        front.material.refractiveIndex = 1.5;

        const middleBehind = new Sphere();
        middleBehind.transform = multiply(
            translation(-1.2, 0.75, 2.5),
            scaling(0.75, 0.75, 0.75)
        );
        middleBehind.material = front.material;

        const right = new Sphere();
        right.transform = multiply(
            translation(1.5, 0.5, -0.5),
            scaling(0.5, 0.5, 0.5)
        );
        right.material.pattern = new RadialGradientPattern(
            color(1, 1, 0),
            color(0, 1, 0)
        );
        right.material.pattern.transform = multiply(
            scaling(0.2, 0.2, 0.2),
            multiply(rotationY(radians(-10)), rotationX(radians(80)))
        );
        right.material.diffuse = 0.7;
        right.material.specular = 0.3;

        return [front, leftSmall, left, middle, middleBehind, right];
    }

    function cubesDemo(): Shape[] {
        const c1 = new Cube();
        c1.transform = multiply(
            translation(0, 1, 1),
            multiply(
                scaling(1.5, 0.5, 0.5),
                multiply(rotationY(radians(-15)), rotationX(radians(22)))
            )
        );
        c1.material.color = color(0.1, 0.5, 1);

        const c2 = new Cube();
        c2.transform = multiply(
            translation(0, 0.75, -1),
            multiply(
                scaling(0.5, 0.5, 0.5),
                multiply(rotationY(radians(45)), rotationX(radians(45)))
            )
        );
        c2.material.color = color(0.4, 0.7, 1);

        return [c1, c2];
    }

    function cylindersDemo(): Shape[] {
        const c1 = new Cylinder();
        c1.minimum = 0;
        c1.maximum = 2;
        c1.transform = multiply(
            translation(0, 1, 1),
            multiply(
                scaling(1.5, 0.5, 0.5),
                multiply(rotationY(radians(-15)), rotationX(radians(22)))
            )
        );
        c1.material.color = color(0.4, 0.7, 1);

        const c2 = new Cylinder();
        c2.minimum = 0;
        c2.maximum = 3;
        c2.closed = true;
        c2.transform = multiply(
            translation(0, 0.75, -1),
            multiply(
                scaling(0.5, 0.5, 0.5),
                multiply(rotationY(radians(45)), rotationX(radians(45)))
            )
        );
        c2.material.color = color(0, 0, 0.3);
        c2.material.reflective = 0.9;
        c2.material.specular = 1;
        c2.material.shininess = 400;

        return [c1, c2];
    }

    function conesDemo(): Shape[] {
        const c1 = new Cone();
        c1.minimum = -3;
        c1.maximum = 0;
        c1.closed = true;
        c1.transform = translation(0, 3, 1);
        c1.material.color = color(0, 0, 0.3);
        c1.material.reflective = 0.9;
        c1.material.transparancy = 1;
        c1.material.refractiveIndex = 1.5;

        return [c1];
    }

    function groupsDemo(): Shape[] {
        function corner(mat: Material): Shape {
            const s = new Sphere();
            s.transform = multiply(
                translation(0, 0, -1),
                scaling(0.2, 0.2, 0.2)
            );
            s.material = mat;
            return s;
        }

        function edge(mat: Material): Shape {
            const cyl = new Cylinder();
            cyl.minimum = 0;
            cyl.maximum = 1;
            cyl.transform = multiply(
                translation(0, 0, -1),
                multiply(
                    rotationY(-Math.PI / 5),
                    multiply(rotationZ(-Math.PI / 2), scaling(0.2, 1.2, 0.2))
                )
            );
            cyl.material = mat;
            return cyl;
        }

        function side(mat: Material): Shape {
            const g = new Group();
            g.add(corner(mat));
            g.add(edge(mat));
            return g;
        }

        function pentagon(mat: Material): Shape {
            const g = new Group();
            for (let i = 0; i < 5; i++) {
                const s = side(mat);
                s.transform = rotationY((i * Math.PI) / 2.5);
                g.add(s);
            }
            return g;
        }

        function halfDodecahedron(colors: Color[]): Shape {
            const g = new Group();
            for (let i = 0; i < 5; i++) {
                const mat = material();
                mat.color = colors[i];
                mat.ambient = 0.3;
                const p = pentagon(mat);
                p.transform = multiply(
                    rotationY((i * Math.PI) / 2.5),
                    multiply(
                        translation(0, 0, 1.2),
                        rotationX(radians(116.565))
                    )
                );
                g.add(p);
            }
            return g;
        }

        const dodecahedron = new Group();
        const d1 = halfDodecahedron(rainbow.slice(0, 5));
        d1.transform = multiply(
            translation(0, 1.2, 0),
            multiply(rotationZ(Math.PI), rotationY(Math.PI / 5))
        );

        const d2 = halfDodecahedron(rainbow.slice(5, 10));

        dodecahedron.add(d1);
        dodecahedron.add(d2);

        dodecahedron.transform = multiply(
            translation(0, 1, 1.5),
            multiply(rotationX(-Math.PI / 6), rotationY(Math.PI / 6))
        );
        return [dodecahedron];
    }

    function trianglesDemo(): Shape {
        const g = new Group();

        const points = [
            point(1, 1, 1),
            point(1, -1, -1),
            point(-1, 1, -1),
            point(-1, -1, 1),
        ];
        const triangles = [
            new Triangle(points[0], points[1], points[2]),
            new Triangle(points[0], points[1], points[3]),
            new Triangle(points[0], points[2], points[3]),
            new Triangle(points[3], points[1], points[2]),
        ];

        triangles.forEach((t, i) => {
            t.material.color = rainbow[i];
            t.material.ambient = 0.3;
            g.add(t);
        });

        g.transform = multiply(
            translation(0, 1, 0),
            multiply(rotationY(Math.PI / 3), rotationZ(Math.PI / 4))
        );
        return g;
    }

    function objParserDemo(): Shape {
        const parser = new ObjParser();
        parser.parse(icosahedronObjFile);

        const g = parser.model.shapes[0] as Group;
        g.shapes.forEach((t, i) => {
            t.material.color = rainbow[i % 12];
            t.material.ambient = 0.3;
            g.add(t);
        });

        g.transform = multiply(
            translation(0, 1, 0),
            multiply(rotationY(Math.PI / 3), rotationZ(Math.PI / 4))
        );
        return parser.model;
    }

    function teapotDemo(highRes: boolean): Shape {
        const parser = new ObjParser();
        const model = parser.parse(
            highRes ? teapotObjFile : teapotLowResObjFile
        );
        model.transform = multiply(
            translation(0, -0.5, 0),
            multiply(scaling(0.1, 0.1, 0.1), rotationX(-Math.PI / 2))
        );
        return model;
    }

    function csgDemo(): Shape {
        const baseMaterial = material();
        baseMaterial.color = color(1, 0, 0);
        baseMaterial.reflective = 0.3;

        function halfCircle(): Shape {
            const outerCylinder = new Cylinder();
            outerCylinder.minimum = 0;
            outerCylinder.maximum = 0.5;
            outerCylinder.closed = true;
            outerCylinder.material = baseMaterial;

            const innerCylinder = new Cylinder();
            innerCylinder.minimum = 0;
            innerCylinder.maximum = 0.6;
            innerCylinder.closed = true;
            innerCylinder.transform = scaling(0.5, 1, 0.5);
            innerCylinder.material = baseMaterial;

            const circle = new CsgShape(
                'difference',
                outerCylinder,
                innerCylinder
            );

            const cube = new Cube();
            cube.transform = translation(-1, 0, 0);

            return new CsgShape('difference', circle, cube);
        }

        function letterP(): Shape {
            const leftLeg = new Cube();
            leftLeg.material = baseMaterial;
            leftLeg.transform = multiply(
                translation(-0.25, 0, -1),
                scaling(0.25, 0.5, 2)
            );

            return new CsgShape('union', leftLeg, halfCircle());
        }

        function letterR(): Shape {
            const rightLeg = new Cube();
            rightLeg.material = baseMaterial;
            rightLeg.transform = multiply(
                translation(0.5, 0, -1.9),
                multiply(scaling(0.25, 0.5, 1.1), shearing(0, -1, 0, 0, 0, 0))
            );

            return new CsgShape('union', rightLeg, letterP());
        }

        function letterB(): Shape {
            const lowerHalfCircle = halfCircle();
            lowerHalfCircle.material = baseMaterial;
            lowerHalfCircle.transform = multiply(
                translation(0, 0, -2),
                scaling(1.25, 1, 1)
            );

            return new CsgShape('union', lowerHalfCircle, letterP());
        }

        const rb = new Group();
        const r = letterR();
        r.transform = translation(-1, 0, 0);
        const b = letterB();
        b.transform = translation(1, 0, 0);
        rb.add(r);
        rb.add(b);

        rb.transform = multiply(
            translation(0, 1, 3),
            multiply(
                scaling(0.5, 0.5, 0.5),
                multiply(rotationY(Math.PI / 6), rotationX(-Math.PI / 2))
            )
        );
        rb.divide(2);
        return rb;
    }

    function textureMappedShereDemo(): Shape {
        const s = new Sphere();
        s.transform = translation(0, 1, 0);
        s.material.pattern = new TextureMap(
            new CheckersUvPattern(
                16,
                8,
                color(0.9, 1, 0.9),
                color(0.1, 0.4, 0.1)
            ),
            new SphericalMapper()
        );
        s.material.diffuse = 0.6;
        s.material.specular = 0;
        s.material.ambient = 0.1;
        s.material.reflective = 0.3;
        return s;
    }

    const world = new World();
    world.lights.push(
        // new PointLight(point(-2.4, 3.5, -2.4), color(0.9, 0.9, 0.9)),
        // new PointLight(point(2.5, 4.99, -2.5), color(0.3, 0.3, 0.3)),
        new AreaLight(
            point(-5.5, 3.5, -5),
            vector(3, 0, 0),
            8,
            vector(0, 3, 0),
            8,
            color(1.5, 1.5, 1.5)
        )
    );

    const lamp = new Cube();
    lamp.material.color = color(1.5, 1.5, 1.5);
    lamp.material.diffuse = 0;
    lamp.material.specular = 0;
    lamp.material.ambient = 1;
    lamp.transform = multiply(translation(-4, 5, -5.1), scaling(1, 1, 0.01));
    world.objects.push(lamp);

    // world.objects.push(...checkeredRoom(color(0.9, 1, 0.9), color(0.1, 0.4, 0.1)));
    // world.objects.push(...spheresDemo());
    // world.objects.push(...cubesDemo(), checkeredFloor(color(0.9, 0.9, 1), color(0.1, 0.1, 0.4)));
    // world.objects.push(...cylindersDemo(), checkeredFloor(color(0.9, 0.9, 1), color(0.1, 0.1, 0.4)));
    // world.objects.push(...conesDemo(), checkeredFloor(color(0.9, 0.9, 1), color(0.1, 0.1, 0.4)));
    // world.objects.push(...groupsDemo(), reflectiveFloor(color(0.2, 0.2, 0.2)));
    // world.objects.push(trianglesDemo(), reflectiveFloor(color(0, 0, 0.1)));
    // world.objects.push(objParserDemo());
    // world.objects.push(teapotDemo(true), reflectiveFloor(color(0.2, 0.2, 0.2)));
    // world.objects.push(csgDemo(), reflectiveFloor(color(0.0, 0.2, 0.0)));

    // world.objects.push(basicShere(), matteFloor());
    world.objects.push(textureMappedShereDemo(), matteFloor());

    return world;
}

export function renderScene(
    world: World,
    width: number,
    height: number
): ImageData {
    const camera = new Camera(width, height, Math.PI / 3);
    camera.transform = viewTransform(
        point(0, 1.5, -5),
        point(0, 1, 0),
        vector(0, 1, 0)
    );

    const startTime = Date.now();
    console.log(`renderScene(${width}X${height}) started..`);
    const canvas = camera.render(world);
    console.log(`   --render time: ${(Date.now() - startTime) / 1000} s`);

    return canvas.getImageData();
}
