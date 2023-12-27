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
  transform: mat4x4<f32>,
  inv_transform: mat4x4<f32>,
  inv_transform_transposed: mat4x4<f32>,
}

struct Ray {
  origin: vec3<f32>,
  direction: vec3<f32>,
}

const SHAPE_SPHERE = 1u;
const SHAPE_PLANE = 2u;
const SHAPE_CUBE = 3u;
const SHAPE_CYLINDER = 4u;
const SHAPE_CONE = 5u;
const SHAPE_TRIANGLE = 6u;
const SHAPE_SMOOTH_TRIANGLE = 7u;
const SHAPE_SCG = 8u;
const SHAPE_GROUP = 9u;

@group(0) @binding(0)
var<uniform> camera: Camera;

@group(0) @binding(1)
var<storage, read> shapes: array<Shape>;

@group(0) @binding(2)
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

  let color = trace(ray_for_pixel(f32(global_id.x), f32(global_id.y)));
  output[global_id.y * camera.width + global_id.x] = u32(color.r * 255.0) | (u32(color.g * 255.0) << 8) | (u32(color.b * 255.0) << 16) | (255u << 24);
}

fn ray_for_pixel(x: f32, y: f32) -> Ray {
  let xoffset = (x + 0.5) * camera.pixel_size;
  let yoffset = (y + 0.5) * camera.pixel_size;

  let world_x = camera.half_width - xoffset;
  let world_y = camera.half_height - yoffset;

  let pixel = (camera.inv_transform * vec4<f32>(world_x, world_y, -camera.focal_distance, 1.0)).xyz;
  let direction = normalize(pixel.xyz - camera.origin.xyz);

  return Ray(camera.origin, direction);
}

fn trace(ray: Ray) -> vec3<f32> {
  let shape_count = arrayLength(&shapes);
  var closest_hit = 1000000.0;
  var closest_shape = 0u;

  for(var i = 0u; i < shape_count; i++) {
    let inv_ray = Ray(
      (shapes[i].inv_transform * vec4<f32>(ray.origin, 1.0)).xyz,
      (shapes[i].inv_transform * vec4<f32>(ray.direction, 0.0)).xyz,
    );

    var hit = -1.0;
    switch(shapes[i].shape_type) {
      case SHAPE_SPHERE: {
        hit = sphere_local_intersects(inv_ray, shapes[i]);
      }
      case SHAPE_PLANE: {
        hit = plane_local_intersects(inv_ray, shapes[i]);
      }
      case SHAPE_CUBE: {
        hit = cube_local_intersects(inv_ray, shapes[i]);
      }
      default: {
        hit = -1.0;
      }
      
    }
    if(hit > 0 && hit < closest_hit) {
      closest_hit = hit;
      closest_shape = i;
    }
  }

  if(closest_hit < 1000000.0) {
    let hit_point = ray.origin + (ray.direction * closest_hit);
    return abs(hit_point)*0.2;
  }

  return vec3<f32>(0.0, 0.0, 0.0);
}

fn sphere_local_intersects(ray: Ray, sphere: Shape) -> f32 {
  let sphere_to_ray = ray.origin.xyz;
  let a = dot(ray.direction, ray.direction);
  let b = 2.0 * dot(ray.direction, ray.origin);
  let c = dot(ray.origin, ray.origin) - 1.0;

  let discriminant = b * b - 4.0 * a * c;
  if(discriminant < 0.0) {
    return -1.0;
  }
  let t1 = (-b - sqrt(discriminant)) / (2.0 * a);
  let t2 = (-b + sqrt(discriminant)) / (2.0 * a);
  if(t1 >= 0.0 && t2 >= 0.0) {
    return min(t1, t2);
  }
  if(t1 >= 0.0) {
    return t1;
  }
  if(t2 >= 0.0) {
    return t2;
  }
  return -1.0;
}

fn plane_local_intersects(ray: Ray, plane: Shape) -> f32 {
  if(abs(ray.direction.y) < 0.0001) {
    return -1.0;
  }
  return -ray.origin.y / ray.direction.y;
}

fn cube_local_intersects(ray: Ray, plane: Shape) -> f32 {
  let x = check_axis(ray.origin.x, ray.direction.x);
  let y = check_axis(ray.origin.y, ray.direction.y);
  let z = check_axis(ray.origin.z, ray.direction.z);

  let tmin = max(max(x.x, y.x), z.x);
  let tmax = min(min(x.y, y.y), z.y);

  if(tmin > tmax) {
    return -1.0;
  }
  return tmin;
}

fn check_axis(origin: f32, direction: f32) -> vec2f {
  let tmin_numerator = -1.0 - origin;
  let tmax_numerator = 1.0 - origin;

  var tmin: f32;
  var tmax: f32;

  if(abs(direction) >= 0.0001) {
    tmin = tmin_numerator / direction;
    tmax = tmax_numerator / direction;
  } else {
    tmin = tmin_numerator * 1000000.0;
    tmax = tmax_numerator * 1000000.0;
  }

  if(tmin < tmax) {
    return vec2f(tmin, tmax);
  }
  return vec2f(tmax, tmin);
}
