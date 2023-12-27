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
  if(camera.max_depth == 0u) {
    return vec3<f32>(0.0, 0.0, 0.0);
  }
  
  let hit = hit(ray);
  if(hit.distance <= 0.0) {
    return vec3<f32>(0.0, 0.0, 0.0);
  }
  // return abs(hit.point)*0.2; // Debug intersection positions

  var normal = normal_at(hit);
  // return abs(normal); // Debug surface normals

  let eye_v = -ray.direction;

  if(dot(normal, eye_v) < 0.0) {
    normal = -normal;
  }

  let adjusted_normal = normal * 0.0001;
  let reflect_v = reflect(ray.direction, normal);

  // todo: support shape materials and lights
  // temporary test with hardcoded material and light:
  var light_intensity = 1.0;
  var light_color = vec3<f32>(1.0, 1.0, 1.0);

  var mat_color = vec3<f32>(1.0, 1.0, 1.0);
  if(shapes[hit.shape_index].shape_type == SHAPE_SPHERE) {
    mat_color = vec3<f32>(0.6, 0.2, 1.0);

  } else if (shapes[hit.shape_index].shape_type == SHAPE_CUBE) {
    mat_color = vec3<f32>(0.2, 1.0, 1.0);
  }
  let mat_specular = 0.9;
  let mat_diffuse = 0.9;
  let mat_shininess = 200.0;

  let effective_color = mat_color * light_color;
  let ambient = effective_color * 0.1;

  if(is_shadowed(hit.point + adjusted_normal, vec3<f32>(0.0, 4.99, 0.0))) {
    return ambient;
  }

  let light_v = normalize(vec3<f32>(0.0, 4.99, 0.0) - hit.point);
  let light_dot_normal = dot(light_v, normal);

  if(light_dot_normal < 0.0) {
    return ambient;
  }

  let diffuse = effective_color * (mat_diffuse * light_dot_normal);

  let reflect_dot_eye = dot(reflect(-light_v, normal), eye_v);
  if(reflect_dot_eye <= 0.0) {
    return ambient + diffuse;
  }

  let specular = (light_color * mat_specular) * pow(reflect_dot_eye, mat_shininess);

  let color = ambient + diffuse + specular;

  return clamp(color, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0));
}

fn is_shadowed(point: vec3<f32>, light: vec3<f32>) -> bool {
  let v = light - point;
  let distance = length(v);
  let direction = normalize(v);

  let r = Ray(point, direction);
  let hit = hit(r);
  if(hit.distance > 0.0 && hit.distance < distance) {
    return true;
  }
  return false;
}