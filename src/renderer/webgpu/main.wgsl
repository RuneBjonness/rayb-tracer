const PI = 3.14159265;
const EPSILON = 0.001;
const SURFACE_EPSILON = 0.005;

struct Camera {
  origin: vec3<f32>,
  inv_transform: mat4x4<f32>,
  pixel_size: f32,
  half_width: f32,
  half_height: f32,
  aperture: f32,
  focal_distance: f32,
  max_depth: u32,
  width: u32,
}

struct Shape {
  shape_type: u32,
  min: f32,
  max: f32,
  closed: u32,

  material_idx: u32,
  parent_idx: u32,
  child_idx_start: u32,
  child_idx_end: u32,

  bound_min: vec3f,
  bound_max: vec3f,

  transform: mat4x4<f32>,
  inv_transform: mat4x4<f32>,
  inv_transform_transposed: mat4x4<f32>,
}

struct Primitive {
  center: vec3f,
  radius_squared: f32,
  shape_type: u32,
  material_idx: u32,
  parent_idx: u32,
}

struct Triangle {
  p1: vec3f,
  e1: vec3f,
  e2: vec3f,
  n1: vec3f,
  shape_type: u32,
  n2: vec3f,
  material_idx: u32,
  n3: vec3f,
  parent_idx: u32,
}

struct BvhNode {
  leaf: u32,
  child_type: u32,
  child_idx_start: u32,
  child_idx_end: u32,
  bound_min: vec3f,
  bound_max: vec3f,
}

struct Light {
  color: vec3f,
  position: vec3f,
  shape_idx: u32,
}

const SHAPE_SPHERE = 1u;
const SHAPE_PLANE = 2u;
const SHAPE_CUBE = 3u;
const SHAPE_CYLINDER = 4u;
const SHAPE_CONE = 5u;
const SHAPE_TRIANGLE = 6u;
const SHAPE_SMOOTH_TRIANGLE = 7u;
const SHAPE_CSG = 8u;
const SHAPE_GROUP = 9u;
const SHAPE_GROUP_BVH = 10u;
const SHAPE_PRIMITIVE_SPHERE = 11u;

const OBJECT_BUFFER_TYPE_SHAPE = 0u;
const OBJECT_BUFFER_TYPE_PRIMITIVE = 1u;
const OBJECT_BUFFER_TYPE_TRIANGLE = 2u;
const OBJECT_BUFFER_TYPE_BVH_NODE = 3u;

@group(0) @binding(0)
var<uniform> camera: Camera;

@group(0) @binding(1)
var<storage, read> shapes: array<Shape>;

@group(0) @binding(2)
var<storage, read> primitives: array<Primitive>;

@group(0) @binding(3)
var<storage, read> triangles: array<Triangle>;

@group(0) @binding(4)
var<storage, read> bvh: array<BvhNode>;

@group(0) @binding(5)
var<uniform> lights: array<Light, 5>;

@group(0) @binding(6)
var<storage, read> materials: array<Material>;

@group(0) @binding(7)
var<storage, read> patterns: array<Pattern>;

@group(0) @binding(8)
var<storage, read> image_data: array<u32>;

@group(0) @binding(9)
var<storage, read_write> output: array<u32>;

@compute @workgroup_size(8,8)
fn main(
  @builtin(global_invocation_id) global_id : vec3<u32>,
  @builtin(local_invocation_id) local_id : vec3<u32>,
) {
  let pixel_count = arrayLength(&output);
  if(global_id.x * global_id.y >= pixel_count) {
    return;
  }

  var color: vec3f = shade_pixel(f32(global_id.x), f32(global_id.y));
  color = clamp(color, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0));

  output[global_id.y * camera.width + global_id.x] = u32(color.r * 255.0) | (u32(color.g * 255.0) << 8) | (u32(color.b * 255.0) << 16) | (255u << 24);
}
