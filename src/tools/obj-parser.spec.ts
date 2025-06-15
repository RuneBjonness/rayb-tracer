import { expect, test } from 'vitest';
import { ObjParser } from './obj-parser';
import { Triangle } from '../lib/shapes/primitives/triangle';
import { point, vector } from '../lib/math/vector4';

test('ignoring unrecognized lines', () => {
  const parser = new ObjParser();
  parser.parse(
    'gibberish gibberish gibberish\nmore gibberish\neven more gibberish'
  );

  expect(parser.ignoredLines).toBe(3);
});

test('parsing vertex records', () => {
  const objData = `
v -1 1 0
v -1.0000 0.5000 0.0000
v 1 0 0
v 1 1 0`;

  const parser = new ObjParser();
  parser.parse(objData);

  expect(parser.vertices[0]).toEqual(point(-1, 1, 0));
  expect(parser.vertices[1]).toEqual(point(-1, 0.5, 0));
  expect(parser.vertices[2]).toEqual(point(1, 0, 0));
  expect(parser.vertices[3]).toEqual(point(1, 1, 0));
});

test('parsing triangle faces', () => {
  const objData = `
v -1 1 0
v -1 0 0
v 1 0 0
v 1 1 0

f 1 2 3
f 1 3 4`;

  const parser = new ObjParser();
  parser.parse(objData);

  const t1 = parser.model.bvhNode?.shapes[0] as Triangle;
  const t2 = parser.model.bvhNode?.shapes[1] as Triangle;

  expect(t1.p1).toEqual(parser.vertices[0]);
  expect(t1.p2).toEqual(parser.vertices[1]);
  expect(t1.p3).toEqual(parser.vertices[2]);

  expect(t2.p1).toEqual(parser.vertices[0]);
  expect(t2.p2).toEqual(parser.vertices[2]);
  expect(t2.p3).toEqual(parser.vertices[3]);
});

test('parsing triangle faces with relative indexes', () => {
  const objData = `
v -1 1 0
v -1 0 0
v 1 0 0
v 1 1 0

f -4 -3 -2
f -4 -2 -1`;

  const parser = new ObjParser();
  parser.parse(objData);

  const t1 = parser.model.bvhNode?.shapes[0] as Triangle;
  const t2 = parser.model.bvhNode?.shapes[1] as Triangle;

  expect(t1.p1).toEqual(parser.vertices[0]);
  expect(t1.p2).toEqual(parser.vertices[1]);
  expect(t1.p3).toEqual(parser.vertices[2]);

  expect(t2.p1).toEqual(parser.vertices[0]);
  expect(t2.p2).toEqual(parser.vertices[2]);
  expect(t2.p3).toEqual(parser.vertices[3]);
});

test('triangulating polygons', () => {
  const objData = `
v -1 1 0
v -1 0 0
v 1 0 0
v 1 1 0
v 0 2 0

f 1 2 3 4 5`;

  const parser = new ObjParser();
  parser.parse(objData);

  const t1 = parser.model.bvhNode?.shapes[0] as Triangle;
  const t2 = parser.model.bvhNode?.shapes[1] as Triangle;
  const t3 = parser.model.bvhNode?.shapes[2] as Triangle;

  expect(t1.p1).toEqual(parser.vertices[0]);
  expect(t1.p2).toEqual(parser.vertices[1]);
  expect(t1.p3).toEqual(parser.vertices[2]);

  expect(t2.p1).toEqual(parser.vertices[0]);
  expect(t2.p2).toEqual(parser.vertices[2]);
  expect(t2.p3).toEqual(parser.vertices[3]);

  expect(t3.p1).toEqual(parser.vertices[0]);
  expect(t3.p2).toEqual(parser.vertices[3]);
  expect(t3.p3).toEqual(parser.vertices[4]);
});

test('parsing named groups', () => {
  const objData = `
v -1 1 0
v -1 0 0
v 1 0 0
v 1 1 0

g FirstGroup
f 1 2 3
g SecondGroup
f 1 3 4`;

  const parser = new ObjParser();
  parser.parse(objData);

  const g1 = parser.groups['FirstGroup'];
  const g2 = parser.groups['SecondGroup'];

  const t1 = g1.bvhNode?.shapes[0] as Triangle;
  const t2 = g2.bvhNode?.shapes[0] as Triangle;

  expect(t1.p1).toEqual(parser.vertices[0]);
  expect(t1.p2).toEqual(parser.vertices[1]);
  expect(t1.p3).toEqual(parser.vertices[2]);

  expect(t2.p1).toEqual(parser.vertices[0]);
  expect(t2.p2).toEqual(parser.vertices[2]);
  expect(t2.p3).toEqual(parser.vertices[3]);
});

test('parsing vertex normal vectors', () => {
  const objData = `
vn 0 0 1
vn 0.707 0 -0.707
vn 1 2 3`;

  const parser = new ObjParser();
  parser.parse(objData);

  expect(parser.normals[0]).toEqual(vector(0, 0, 1));
  expect(parser.normals[1]).toEqual(vector(0.707, 0, -0.707));
  expect(parser.normals[2]).toEqual(vector(1, 2, 3));
});

test('parsing triangle faces with normals', () => {
  const objData = `
v 0 1 0
v -1 0 0
v 1 0 0

vn -1 0 0
vn 1 0 0
vn 0 1 0

f 1//3 2//1 3//2
f 1/0/3 2/102/1 3/14/2`;

  const parser = new ObjParser();
  parser.parse(objData);

  const t1 = parser.model.bvhNode?.shapes[0] as Triangle;
  const t2 = parser.model.bvhNode?.shapes[1] as Triangle;

  expect(t1.p1).toEqual(parser.vertices[0]);
  expect(t1.p2).toEqual(parser.vertices[1]);
  expect(t1.p3).toEqual(parser.vertices[2]);

  expect(t1.n1).toEqual(parser.normals[2]);
  expect(t1.n2).toEqual(parser.normals[0]);
  expect(t1.n3).toEqual(parser.normals[1]);

  expect(t2).toEqual(t1);
});
