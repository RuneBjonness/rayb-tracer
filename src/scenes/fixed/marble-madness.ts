import { RenderConfiguration } from '../../renderer/configuration';
import { AreaLight } from '../../lib/lights';
import { Group } from '../../lib/shapes/group';
import { Plane } from '../../lib/shapes/primitives/plane';
import { Sphere } from '../../lib/shapes/primitives/sphere';
import { Shape } from '../../lib/shapes/shape';
import {
  translation,
  scaling,
  radians,
  rotationY,
  rotationZ,
} from '../../lib/math/transformations';
import { Color } from '../../lib/math/color';
import { World } from '../../lib/world';
import { Scene } from '../scene';
import { Checkers3dPattern } from '../../lib/patterns/patterns';

export class MarbleMadness extends Scene {
  constructor(renderCfg: RenderConfiguration) {
    super(
      {
        name: 'MarbleMadness',
        camera: {
          fieldOfView: 60,
          viewTransform: {
            from: [0, 7, -5],
            to: [0, 1, 2],
            up: [0, 1, 0],
          },
          aperture: 0.005,
          focalDistance: 5,
        },
        world: {},
      },
      renderCfg
    );
    this.world = this.configureWorld(renderCfg);
  }

  configureWorld(renderCfg: RenderConfiguration): World {
    const world = new World();
    const lamp = new AreaLight(
      new Color(1.5, 1.5, 1.5),
      renderCfg.maxLightSamples,
      renderCfg.adaptiveLightSamplingSensitivity
    );
    lamp.transform = translation(-7, 6, -3).multiply(rotationZ(radians(30)));

    world.lights.push(lamp);
    world.objects.push(lamp);

    const floor = new Plane();
    floor.material.pattern = new Checkers3dPattern(
      new Color(0.8, 0.7, 1),
      new Color(0.15, 0.1, 0.3)
    );
    floor.material.pattern.transform = translation(0, 0.5, 0).multiply(
      rotationY(radians(-45))
    );
    floor.material.specular = 0.8;
    floor.material.reflective = 0.3;
    world.objects.push(floor);

    //this.generatedMarbleData = this.generateMarbleData(30, 20);

    const marbles = new Group();
    for (let i = 0; i < this.generatedMarbleData.length; i++) {
      marbles.add(
        this.reflectiveSphere(
          new Color(
            this.generatedMarbleData[i][0],
            this.generatedMarbleData[i][1],
            this.generatedMarbleData[i][2]
          ),
          this.generatedMarbleData[i][3],
          this.generatedMarbleData[i][4],
          this.generatedMarbleData[i][5]
        )
      );
    }
    marbles.divide(2);
    world.objects.push(marbles);

    return world;
  }

  private basicSphere(
    color: Color,
    x: number,
    z: number,
    scale: number
  ): Shape {
    const s = new Sphere();
    s.transform = translation(x, scale, z).multiply(
      scaling(scale, scale, scale)
    );
    s.material.color = color;
    return s;
  }

  private reflectiveSphere(
    color: Color,
    x: number,
    z: number,
    scale: number
  ): Shape {
    const s = this.basicSphere(color, x, z, scale);
    s.material.diffuse = 0.8;
    s.material.specular = 0;
    s.material.ambient = 0.1;
    s.material.reflective = 0.3;
    return s;
  }

  private glassSphere(
    color: Color,
    x: number,
    z: number,
    scale: number
  ): Shape {
    const s = this.basicSphere(color, x, z, scale);
    s.material.reflective = 0.9;
    s.material.transparency = 1;
    s.material.refractiveIndex = 1.5;
    s.material.diffuse = 0.9;
    s.material.specular = 0.9;
    s.material.shininess = 200.0;
    return s;
  }

  private generateMarbleData(width: number, depth: number): number[][] {
    const params = [];
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const c = new Color(Math.random(), Math.random(), Math.random());
        const xpos = -width / 2 + x + Math.random();
        const zpos = -2.5 + z + Math.random();
        const scale = 0.15 + Math.random() * 0.1;
        params.push([
          Number(c.r.toFixed(3)),
          Number(c.g.toFixed(3)),
          Number(c.b.toFixed(3)),
          Number(xpos.toFixed(3)),
          Number(zpos.toFixed(3)),
          Number(scale.toFixed(3)),
        ]);
      }
    }
    console.log(JSON.stringify(params));
    return params;
  }

  private generatedMarbleData = [
    [0.846, 0.16, 0.599, -14.733, -1.782, 0.172],
    [0.577, 0.716, 0.409, -14.58, -1.017, 0.238],
    [0.256, 0.254, 0.766, -14.062, 0.059, 0.246],
    [0.395, 0.808, 0.685, -14.404, 0.594, 0.216],
    [0.621, 0.897, 0.237, -14.806, 1.801, 0.196],
    [0.138, 0.984, 0.874, -14.159, 2.61, 0.245],
    [0.022, 0.968, 0.353, -14.496, 4.49, 0.174],
    [0.48, 0.002, 0.813, -14.69, 4.855, 0.191],
    [0.796, 0.23, 0.185, -14.188, 5.562, 0.162],
    [0.263, 0.835, 0.864, -14.807, 7.009, 0.166],
    [0.882, 0.856, 0.776, -14.476, 8.148, 0.244],
    [0.903, 0.97, 0.22, -14.796, 9.264, 0.172],
    [0.983, 0.902, 0.099, -14.484, 9.847, 0.233],
    [0.542, 0.312, 0.463, -14.852, 11.358, 0.231],
    [0.734, 0.275, 0.932, -14.026, 12.304, 0.229],
    [0.945, 0.391, 0.184, -14.928, 12.888, 0.224],
    [0.372, 0.683, 0.627, -14.754, 14.402, 0.228],
    [0.989, 0.461, 0.124, -14.472, 15.367, 0.159],
    [0.391, 0.424, 0.788, -14.294, 16.11, 0.151],
    [0.394, 0.868, 0.021, -14.482, 17.481, 0.224],
    [0.799, 0.404, 0.754, -13.129, -2.155, 0.179],
    [0.634, 0.37, 0.081, -13.771, -1.262, 0.168],
    [0.26, 0.524, 0.802, -13.306, 0.181, 0.195],
    [0.134, 0.736, 0.839, -13.83, 0.941, 0.191],
    [0.379, 0.973, 0.47, -13.068, 2.435, 0.242],
    [0.847, 0.295, 0.817, -13.433, 2.521, 0.157],
    [0.068, 0.41, 0.09, -13.608, 3.99, 0.176],
    [0.125, 0.772, 0.056, -13.07, 4.778, 0.199],
    [0.499, 0.281, 0.263, -13.162, 6.043, 0.221],
    [0.554, 0.355, 0.729, -13.075, 6.92, 0.156],
    [0.117, 0.45, 0.755, -13.969, 8.251, 0.247],
    [0.433, 0.795, 0.534, -13.375, 8.614, 0.209],
    [0.456, 0.786, 0.534, -13.677, 10.427, 0.182],
    [0.71, 0.658, 0.641, -13.113, 11.267, 0.194],
    [0.632, 0.677, 0.302, -13.04, 11.99, 0.249],
    [0.183, 0.423, 0.234, -13.408, 13.28, 0.242],
    [0.048, 0.158, 0.156, -13.762, 14.357, 0.185],
    [0.906, 0.631, 0.114, -13.479, 15.375, 0.211],
    [0.183, 0.714, 0.692, -13.152, 16.019, 0.242],
    [0.163, 0.005, 0.592, -13.994, 17.4, 0.188],
    [0.526, 0.026, 0.937, -12.301, -1.669, 0.224],
    [0.957, 0.181, 0.608, -12.809, -0.753, 0.191],
    [0.293, 0.479, 0.614, -12.037, 0.311, 0.158],
    [0.515, 0.473, 0.509, -12.06, 1.318, 0.239],
    [0.31, 0.843, 0.436, -12.039, 2.168, 0.196],
    [0.944, 0.756, 0.04, -12.417, 2.986, 0.181],
    [0.888, 0.284, 0.688, -12.959, 3.651, 0.165],
    [0.898, 0.802, 0.006, -12.439, 5.284, 0.184],
    [0.409, 0.249, 0.527, -12.688, 5.858, 0.216],
    [0.266, 0.813, 0.166, -12.85, 6.892, 0.247],
    [0.92, 0.475, 0.405, -12.623, 8.493, 0.211],
    [0.359, 0.604, 0.179, -12.619, 9.251, 0.2],
    [0.132, 0.451, 0.234, -12.796, 10.311, 0.192],
    [0.992, 0.561, 0.886, -12.254, 10.552, 0.188],
    [0.841, 0.985, 0.113, -12.931, 11.804, 0.248],
    [0.816, 0.438, 0.025, -12.893, 12.818, 0.183],
    [0.715, 0.049, 0.065, -12.056, 14.437, 0.17],
    [0.861, 0.821, 0.677, -12.939, 15.412, 0.157],
    [0.728, 0.901, 0.504, -12.339, 15.834, 0.176],
    [0.227, 0.667, 0.915, -12.866, 17.339, 0.165],
    [0.658, 0.387, 0.998, -11.278, -1.692, 0.198],
    [0.73, 0.099, 0.386, -11.526, -0.754, 0.16],
    [0.106, 0.438, 0.222, -11.012, -0.457, 0.233],
    [0.413, 0.935, 0.503, -11.005, 1.416, 0.249],
    [0.249, 0.209, 0.961, -11.935, 2.234, 0.184],
    [0.256, 0.22, 0.551, -11.973, 2.97, 0.176],
    [0.644, 0.858, 0.544, -11.741, 3.77, 0.187],
    [0.34, 0.647, 0.784, -11.819, 4.707, 0.2],
    [0.121, 0.188, 0.811, -11.107, 5.833, 0.151],
    [0.923, 0.945, 0.927, -11.33, 7.293, 0.217],
    [0.008, 0.374, 0.222, -11.202, 7.612, 0.224],
    [0.839, 0.804, 0.716, -11.276, 9.017, 0.247],
    [0.973, 0.434, 0.95, -11.096, 9.881, 0.184],
    [0.214, 0.641, 0.924, -11.879, 11.088, 0.151],
    [0.744, 0.763, 0.4, -11.194, 11.645, 0.161],
    [0.961, 0.756, 0.441, -11.894, 13.221, 0.179],
    [0.181, 0.796, 0.842, -11.888, 13.588, 0.16],
    [0.329, 0.947, 0.094, -11.627, 14.676, 0.242],
    [0.635, 0.644, 0.81, -11.502, 15.941, 0.233],
    [0.021, 0.768, 0.607, -11.825, 16.891, 0.153],
    [0.617, 0.598, 0.587, -10.833, -2.105, 0.224],
    [0.619, 0.446, 0.808, -10.009, -1.195, 0.217],
    [0.603, 0.375, 0.992, -10.3, -0.291, 0.157],
    [0.088, 0.433, 0.791, -10.634, 1.172, 0.222],
    [0.115, 0.901, 0.121, -10.096, 1.759, 0.221],
    [0.869, 0.864, 0.313, -10.41, 3.365, 0.15],
    [0.24, 0.601, 0.842, -10.495, 3.885, 0.235],
    [0.874, 0.937, 0.367, -10.502, 5.415, 0.22],
    [0.823, 0.555, 0.12, -10.934, 5.619, 0.153],
    [0.464, 0.189, 0.793, -10.888, 7.081, 0.196],
    [0.585, 0.589, 0.388, -10.992, 8.341, 0.184],
    [0.033, 0.429, 0.478, -10.609, 9.304, 0.193],
    [0.23, 0.116, 0.923, -10.866, 10.411, 0.178],
    [0.033, 0.402, 0.986, -10.032, 10.569, 0.249],
    [0.725, 0.487, 0.48, -10.145, 11.606, 0.208],
    [0.518, 0.364, 0.771, -10.162, 13.369, 0.235],
    [0.137, 0.073, 0.601, -10.068, 13.723, 0.21],
    [0.378, 0.165, 0.83, -10.147, 15.289, 0.159],
    [0.675, 0.471, 0.186, -10.786, 15.547, 0.153],
    [0.18, 0.341, 0.929, -10.668, 16.924, 0.183],
    [0.894, 0.628, 0.406, -9.657, -1.993, 0.179],
    [0.669, 0.918, 0.484, -9.356, -0.593, 0.152],
    [0.088, 0.446, 0.861, -9.827, 0.181, 0.23],
    [0.543, 0.107, 0.912, -9.099, 0.985, 0.157],
    [0.933, 0.614, 0.791, -9.459, 2.039, 0.23],
    [0.185, 0.438, 0.685, -9.404, 3.195, 0.241],
    [0.178, 0.38, 0.431, -9.146, 3.959, 0.179],
    [0.671, 0.115, 0.947, -9.039, 5.074, 0.226],
    [0.338, 0.007, 0.122, -9.198, 6.306, 0.224],
    [0.179, 0.019, 0.62, -9.143, 6.989, 0.214],
    [0.756, 0.922, 0.624, -9.49, 8.312, 0.158],
    [0.429, 0.592, 0.154, -9.822, 8.855, 0.215],
    [0.439, 0.43, 0.79, -9.586, 10.225, 0.18],
    [0.399, 0.065, 0.168, -9.554, 10.634, 0.208],
    [0.924, 0.972, 0.018, -9.511, 12.468, 0.172],
    [0.684, 0.887, 0.468, -9.316, 13.479, 0.228],
    [0.229, 0.551, 0.41, -9.751, 13.804, 0.198],
    [0.201, 0.434, 0.21, -9.153, 15.018, 0.222],
    [0.441, 0.119, 0.467, -9.655, 15.723, 0.155],
    [0.824, 0.821, 0.9, -9.983, 17.234, 0.231],
    [0.647, 0.415, 0.118, -8.291, -2.086, 0.174],
    [0.504, 0.769, 0.479, -8.429, -0.735, 0.227],
    [0.495, 0.613, 0.867, -8.92, -0.198, 0.201],
    [0.626, 0.44, 0.243, -8.67, 1.073, 0.203],
    [0.428, 0.032, 0.855, -8.208, 2.25, 0.2],
    [0.093, 0.732, 0.643, -8.87, 2.59, 0.218],
    [0.254, 0.329, 0.363, -8.075, 3.987, 0.187],
    [0.444, 0.776, 0.88, -8.7, 5.493, 0.178],
    [0.445, 0.011, 0.382, -8.511, 6.243, 0.182],
    [0.797, 0.549, 0.347, -8.858, 7.494, 0.162],
    [0.656, 0.716, 0.176, -8.967, 8.199, 0.217],
    [0.541, 0.606, 0.167, -8.18, 8.673, 0.242],
    [0.585, 0.402, 0.807, -8.424, 9.591, 0.244],
    [0.566, 0.992, 0.151, -8.3, 10.587, 0.225],
    [0.608, 0.969, 0.313, -8.99, 12.339, 0.161],
    [0.868, 0.87, 0.753, -8.031, 12.952, 0.212],
    [0.213, 0.83, 0.181, -8.066, 14.269, 0.175],
    [0.536, 0.653, 0.495, -8.766, 15.491, 0.165],
    [0.354, 0.938, 0.465, -8.155, 16.107, 0.172],
    [0.642, 0.658, 0.563, -8.802, 16.592, 0.23],
    [0.567, 0.907, 0.082, -7.471, -1.98, 0.157],
    [0.396, 0.247, 0.352, -7.507, -1.164, 0.186],
    [0.983, 0.495, 0.673, -7.808, 0.285, 0.159],
    [0.877, 0.81, 0.152, -7.999, 1.141, 0.229],
    [0.026, 0.688, 0.754, -7.454, 2.161, 0.206],
    [0.379, 0.044, 0.499, -7.831, 2.55, 0.232],
    [0.915, 0.497, 0.262, -7.817, 4.223, 0.164],
    [0.008, 0.899, 0.65, -7.724, 4.848, 0.232],
    [0.696, 0.753, 0.466, -7.737, 6.006, 0.24],
    [0.349, 0.724, 0.506, -7.222, 7.453, 0.158],
    [0.291, 0.567, 0.745, -7.354, 7.524, 0.245],
    [0.578, 0.826, 0.61, -7.693, 8.703, 0.185],
    [0.355, 0.693, 0.099, -7.959, 10.293, 0.2],
    [0.496, 0.914, 0.275, -7.087, 11.467, 0.189],
    [0.315, 0.21, 0.123, -7.212, 12.067, 0.182],
    [0.139, 0.333, 0.242, -7.046, 12.832, 0.182],
    [0.108, 0.618, 0.481, -7.382, 14.005, 0.19],
    [0.737, 0.119, 0.442, -7.25, 14.571, 0.217],
    [0.85, 0.042, 0.076, -7.77, 16.053, 0.189],
    [0.779, 0.553, 0.484, -7.884, 17.102, 0.185],
    [0.147, 0.255, 0.949, -6.706, -1.874, 0.179],
    [0.989, 0.552, 0.579, -6.818, -1.4, 0.239],
    [0.045, 0.294, 0.581, -6.299, 0.354, 0.162],
    [0.651, 0.593, 0.05, -6.098, 1.473, 0.196],
    [0.929, 0.01, 0.739, -6.994, 1.691, 0.171],
    [0.162, 0.301, 0.802, -6.549, 2.619, 0.174],
    [0.204, 0.899, 0.248, -6.945, 4.135, 0.242],
    [0.8, 0.538, 0.029, -6.99, 5.234, 0.179],
    [0.258, 0.316, 0.543, -6.627, 6.452, 0.197],
    [0.461, 0.077, 0.785, -6.372, 6.552, 0.204],
    [0.846, 0.614, 0.29, -6.51, 8.157, 0.201],
    [0.568, 0.76, 0.657, -6.841, 9.101, 0.244],
    [0.984, 0.908, 0.937, -6.765, 10.099, 0.219],
    [0.358, 0.182, 0.084, -6.502, 11.492, 0.238],
    [0.046, 0.102, 0.811, -6.644, 12.295, 0.233],
    [0.443, 0.529, 0.043, -6.631, 13.026, 0.211],
    [0.589, 0.765, 0.655, -6.849, 14.07, 0.213],
    [0.935, 0.874, 0.655, -6.868, 15.281, 0.204],
    [0.439, 0.343, 0.606, -6.301, 16.323, 0.168],
    [0.597, 0.673, 0.073, -6.354, 16.786, 0.214],
    [0.299, 0.403, 0.665, -5.661, -2.26, 0.227],
    [0.212, 0.737, 0.045, -5.154, -1.116, 0.161],
    [0.182, 0.548, 0.343, -5.954, -0.09, 0.203],
    [0.992, 0.841, 0.59, -5.885, 0.988, 0.181],
    [0.283, 0.749, 0.41, -5.983, 2.314, 0.158],
    [0.278, 0.663, 0.566, -5.673, 3.156, 0.188],
    [0.084, 0.531, 0.281, -5.458, 4.333, 0.179],
    [0.033, 0.874, 0.355, -5.737, 4.885, 0.232],
    [0.37, 0.325, 0.659, -5.709, 5.706, 0.242],
    [0.232, 0.728, 0.289, -5.861, 7.245, 0.167],
    [0.725, 0.188, 0.853, -5.708, 7.892, 0.194],
    [0.702, 0.789, 0.636, -5.837, 9.22, 0.184],
    [0.838, 0.576, 0.98, -5.882, 9.503, 0.2],
    [0.324, 0.323, 0.24, -5.603, 10.916, 0.197],
    [0.113, 0.843, 0.506, -5.945, 12.422, 0.189],
    [0.673, 0.605, 0.304, -5.825, 13.412, 0.2],
    [0.907, 0.512, 0.735, -5.863, 13.78, 0.159],
    [0.269, 0.342, 0.025, -5.588, 14.693, 0.19],
    [0.222, 0.862, 0.991, -5.595, 15.914, 0.162],
    [0.672, 0.33, 0.518, -5.474, 16.882, 0.187],
    [0.051, 0.471, 0.549, -4.241, -1.939, 0.196],
    [0.771, 0.758, 0.371, -4.385, -0.721, 0.212],
    [0.336, 0.447, 0.556, -4.416, -0.471, 0.209],
    [0.471, 0.283, 0.875, -4.547, 1.139, 0.195],
    [0.043, 0.944, 0.5, -4.186, 2.392, 0.169],
    [0.975, 0.871, 0.139, -4.12, 2.773, 0.153],
    [0.528, 0.931, 0.305, -4.535, 4.308, 0.178],
    [0.343, 0.253, 0.579, -4.458, 4.778, 0.19],
    [0.225, 0.485, 0.233, -4.522, 6.466, 0.159],
    [0.652, 0.134, 0.668, -4.984, 6.974, 0.172],
    [0.536, 0.577, 0.632, -4.568, 8.226, 0.227],
    [0.208, 0.957, 0.327, -4.592, 9.321, 0.214],
    [0.798, 0.67, 0.226, -4.497, 10.0, 0.166],
    [0.566, 0.143, 0.032, -4.138, 11.482, 0.159],
    [0.563, 0.84, 0.552, -4.611, 11.638, 0.222],
    [0.597, 0.801, 0.383, -4.211, 13.341, 0.232],
    [0.152, 0.448, 0.088, -4.205, 13.879, 0.17],
    [0.179, 0.001, 0.724, -4.797, 14.896, 0.212],
    [0.812, 0.813, 0.937, -4.872, 16.289, 0.172],
    [0.433, 0.946, 0.81, -4.667, 16.745, 0.226],
    [0.442, 0.789, 0.568, -3.724, -2.345, 0.158],
    [0.97, 0.141, 0.964, -3.53, -0.755, 0.213],
    [0.92, 0.516, 0.457, -3.846, 0.15, 0.201],
    [0.632, 0.085, 0.238, -3.372, 0.727, 0.181],
    [0.083, 0.47, 0.83, -3.524, 1.622, 0.231],
    [0.039, 0.401, 0.627, -3.695, 2.938, 0.207],
    [0.291, 0.07, 0.23, -3.704, 4.221, 0.218],
    [0.496, 0.297, 0.303, -3.219, 4.715, 0.222],
    [0.887, 0.192, 0.06, -3.369, 6.431, 0.163],
    [0.286, 0.647, 0.017, -3.039, 6.919, 0.21],
    [0.589, 0.383, 0.411, -3.065, 7.505, 0.22],
    [0.367, 0.155, 0.367, -3.502, 9.358, 0.234],
    [0.313, 0.715, 0.625, -3.863, 10.461, 0.206],
    [0.775, 0.755, 0.982, -3.721, 11.069, 0.243],
    [0.72, 0.386, 0.766, -3.53, 11.51, 0.178],
    [0.631, 0.939, 0.408, -3.266, 13.439, 0.214],
    [0.849, 0.313, 0.452, -3.944, 14.184, 0.157],
    [0.125, 0.299, 0.474, -3.127, 14.824, 0.225],
    [0.449, 0.924, 0.217, -3.509, 15.627, 0.157],
    [0.84, 0.291, 0.905, -3.491, 16.64, 0.16],
    [0.009, 0.841, 0.296, -2.731, -1.838, 0.154],
    [0.645, 0.491, 0.302, -2.549, -0.564, 0.183],
    [0.955, 0.993, 0.788, -2.716, -0.019, 0.171],
    [0.884, 0.013, 0.615, -2.817, 1.306, 0.208],
    [0.572, 0.912, 0.537, -2.107, 1.739, 0.159],
    [0.211, 0.011, 0.106, -2.911, 3.266, 0.191],
    [0.892, 0.349, 0.628, -2.94, 3.59, 0.164],
    [0.883, 0.416, 0.224, -2.559, 5.325, 0.195],
    [0.696, 0.337, 0.327, -2.788, 6.351, 0.204],
    [0.021, 0.422, 0.837, -2.445, 7.257, 0.177],
    [0.289, 0.97, 0.52, -2.272, 8.295, 0.203],
    [0.931, 0.817, 0.927, -2.722, 9.072, 0.172],
    [0.656, 0.52, 0.306, -2.57, 9.893, 0.193],
    [0.243, 0.435, 0.773, -2.763, 10.636, 0.214],
    [0.769, 0.555, 0.107, -2.524, 12.164, 0.228],
    [0.116, 0.16, 0.863, -2.461, 13.389, 0.208],
    [0.004, 0.879, 0.811, -2.758, 14.366, 0.204],
    [0.195, 0.609, 0.199, -2.156, 14.663, 0.154],
    [0.388, 0.254, 0.761, -2.907, 16.463, 0.206],
    [0.921, 0.547, 0.8, -2.924, 16.734, 0.247],
    [0.721, 0.757, 0.127, -1.641, -2.49, 0.191],
    [0.608, 0.258, 0.425, -1.847, -0.518, 0.187],
    [0.612, 0.697, 0.705, -1.886, -0.389, 0.183],
    [0.537, 0.404, 0.754, -1.556, 0.897, 0.249],
    [0.113, 0.324, 0.472, -1.965, 1.7, 0.238],
    [0.836, 0.949, 0.927, -1.091, 3.21, 0.185],
    [0.231, 0.514, 0.425, -1.338, 4.002, 0.153],
    [0.237, 0.416, 0.309, -1.253, 5.279, 0.172],
    [0.702, 0.116, 0.202, -1.038, 6.452, 0.151],
    [0.766, 0.245, 0.738, -1.083, 6.992, 0.199],
    [0.963, 0.028, 0.053, -1.854, 7.534, 0.163],
    [0.753, 0.328, 0.275, -1.668, 8.675, 0.222],
    [0.359, 0.744, 0.13, -1.107, 10.154, 0.183],
    [0.224, 0.81, 0.659, -1.395, 10.568, 0.222],
    [0.197, 0.032, 0.913, -1.404, 11.813, 0.183],
    [0.223, 0.405, 0.28, -1.106, 13.339, 0.207],
    [0.952, 0.181, 0.56, -1.799, 13.763, 0.21],
    [0.377, 0.636, 0.75, -1.672, 15.06, 0.16],
    [0.745, 0.466, 0.488, -1.14, 16.373, 0.187],
    [0.803, 0.868, 0.666, -1.856, 17.374, 0.159],
    [0.581, 0.457, 0.061, -0.22, -1.806, 0.218],
    [0.448, 0.978, 0.944, -0.632, -0.688, 0.246],
    [0.201, 0.878, 0.348, -0.161, 0.076, 0.247],
    [0.288, 0.632, 0.343, -0.955, 1.092, 0.182],
    [0.19, 0.385, 0.633, -0.698, 2.192, 0.235],
    [0.334, 0.554, 0.99, -0.066, 3.22, 0.244],
    [0.009, 0.529, 0.994, -0.254, 4.306, 0.194],
    [0.857, 0.299, 0.251, -0.434, 5.493, 0.199],
    [0.935, 0.929, 0.742, -0.091, 5.542, 0.2],
    [0.556, 0.287, 0.565, -0.762, 6.824, 0.164],
    [0.816, 0.739, 0.217, -0.044, 8.063, 0.2],
    [0.825, 0.776, 0.548, -0.368, 8.517, 0.243],
    [0.61, 0.766, 0.428, -0.174, 9.642, 0.189],
    [0.783, 0.701, 0.576, -0.876, 10.668, 0.193],
    [0.768, 0.49, 0.546, -0.9, 12.028, 0.185],
    [0.127, 0.282, 0.749, -0.19, 13.277, 0.17],
    [0.792, 1.0, 0.544, -0.556, 14.223, 0.166],
    [0.62, 0.345, 0.434, -0.673, 15.008, 0.217],
    [0.635, 0.937, 0.428, -0.853, 15.619, 0.195],
    [0.95, 0.014, 0.401, -0.512, 17.441, 0.173],
    [0.818, 0.548, 0.174, 0.374, -2.02, 0.175],
    [0.119, 0.451, 0.523, 0.107, -1.15, 0.205],
    [0.572, 0.148, 0.941, 0.866, 0.335, 0.204],
    [0.419, 0.525, 0.079, 0.053, 1.203, 0.234],
    [0.909, 0.677, 0.153, 0.863, 2.384, 0.211],
    [0.834, 0.096, 0.752, 0.401, 3.422, 0.162],
    [0.319, 0.602, 0.242, 0.698, 4.357, 0.166],
    [0.54, 0.447, 0.777, 0.027, 4.58, 0.151],
    [0.581, 0.948, 0.737, 0.814, 6.234, 0.238],
    [0.187, 0.25, 0.907, 0.239, 6.795, 0.249],
    [0.973, 0.149, 0.248, 0.019, 7.648, 0.194],
    [0.156, 0.579, 0.238, 0.845, 8.775, 0.238],
    [0.119, 0.348, 0.247, 0.263, 10.087, 0.222],
    [0.037, 0.612, 0.165, 0.189, 10.768, 0.162],
    [0.608, 0.979, 0.339, 0.868, 12.081, 0.169],
    [0.842, 0.892, 0.371, 0.268, 13.316, 0.182],
    [0.278, 0.485, 0.188, 0.05, 14.1, 0.217],
    [0.584, 0.692, 0.813, 0.237, 14.987, 0.195],
    [0.617, 0.435, 0.758, 0.422, 15.611, 0.211],
    [0.95, 0.131, 0.738, 0.876, 17.4, 0.217],
    [0.73, 0.137, 0.171, 1.467, -1.763, 0.151],
    [0.072, 0.353, 0.018, 1.795, -1.09, 0.214],
    [0.96, 0.523, 0.197, 1.271, -0.468, 0.241],
    [0.519, 0.472, 0.097, 1.582, 0.682, 0.203],
    [0.127, 0.293, 0.537, 1.212, 1.918, 0.233],
    [0.199, 0.028, 0.817, 1.78, 3.231, 0.18],
    [0.94, 0.846, 0.752, 1.223, 3.607, 0.242],
    [0.31, 0.453, 0.07, 1.664, 5.277, 0.206],
    [0.172, 0.8, 0.074, 1.743, 5.523, 0.201],
    [0.609, 0.466, 0.796, 1.98, 7.338, 0.183],
    [0.543, 0.239, 0.451, 1.995, 7.968, 0.191],
    [0.338, 0.116, 0.535, 1.236, 8.764, 0.16],
    [0.533, 0.203, 0.428, 1.774, 10.399, 0.161],
    [0.471, 0.153, 0.398, 1.389, 10.666, 0.219],
    [0.194, 0.114, 0.521, 1.673, 12.244, 0.249],
    [0.686, 0.53, 0.394, 1.465, 12.71, 0.205],
    [0.155, 0.607, 0.849, 1.056, 13.707, 0.198],
    [0.034, 0.819, 0.489, 1.08, 15.267, 0.183],
    [0.387, 0.939, 0.374, 1.502, 15.965, 0.22],
    [0.922, 0.156, 0.376, 1.59, 16.807, 0.165],
    [0.308, 0.891, 0.192, 2.397, -1.702, 0.159],
    [0.21, 0.068, 0.856, 2.063, -0.948, 0.181],
    [0.455, 0.571, 0.074, 2.361, -0.031, 0.163],
    [0.456, 0.125, 0.398, 2.599, 0.74, 0.236],
    [0.588, 0.377, 0.635, 2.003, 1.606, 0.166],
    [0.8, 0.854, 0.933, 2.59, 2.61, 0.183],
    [0.233, 0.124, 0.603, 2.151, 4.495, 0.2],
    [0.867, 0.759, 0.143, 2.529, 4.565, 0.238],
    [0.986, 0.265, 0.766, 2.702, 5.929, 0.162],
    [0.928, 0.53, 0.665, 2.874, 7.299, 0.217],
    [0.279, 0.502, 0.355, 2.504, 7.783, 0.189],
    [0.656, 0.7, 0.34, 2.674, 8.996, 0.234],
    [0.255, 0.447, 0.234, 2.474, 10.03, 0.199],
    [0.485, 0.148, 0.324, 2.435, 10.561, 0.227],
    [0.903, 0.643, 0.968, 2.27, 12.12, 0.196],
    [0.946, 0.98, 0.895, 2.786, 12.675, 0.163],
    [0.963, 0.869, 0.753, 2.359, 13.824, 0.234],
    [0.927, 0.247, 0.658, 2.116, 15.456, 0.195],
    [0.939, 0.852, 0.29, 2.054, 16.166, 0.169],
    [0.148, 0.76, 0.731, 2.311, 16.992, 0.156],
    [0.344, 0.466, 0.639, 3.89, -2.011, 0.172],
    [0.985, 0.746, 0.875, 3.593, -0.512, 0.182],
    [0.086, 0.898, 0.349, 3.703, -0.042, 0.159],
    [0.057, 0.55, 0.513, 3.628, 0.979, 0.192],
    [0.906, 0.369, 0.858, 3.736, 2.403, 0.209],
    [0.563, 0.573, 0.007, 3.8, 2.919, 0.202],
    [0.71, 0.097, 0.365, 3.291, 4.371, 0.164],
    [0.7, 0.578, 0.862, 3.407, 4.657, 0.242],
    [0.289, 0.574, 0.791, 3.781, 5.683, 0.218],
    [0.092, 0.412, 0.51, 3.154, 6.514, 0.162],
    [0.799, 0.506, 0.573, 3.576, 7.581, 0.154],
    [0.878, 0.253, 0.435, 3.757, 8.968, 0.226],
    [0.208, 0.015, 0.101, 3.592, 9.918, 0.191],
    [0.358, 0.72, 0.15, 3.295, 11.05, 0.151],
    [0.383, 0.973, 0.163, 3.418, 11.855, 0.179],
    [0.555, 0.648, 0.307, 3.627, 12.592, 0.209],
    [0.267, 0.599, 0.2, 3.684, 14.244, 0.191],
    [0.178, 0.622, 0.124, 3.026, 14.901, 0.242],
    [0.509, 0.078, 0.972, 3.444, 15.539, 0.193],
    [0.934, 0.123, 0.092, 3.74, 16.557, 0.185],
    [0.361, 0.227, 0.375, 4.204, -2.209, 0.185],
    [0.668, 0.103, 0.802, 4.333, -0.61, 0.217],
    [0.761, 0.144, 0.459, 4.732, 0.085, 0.234],
    [0.374, 0.878, 0.8, 4.253, 1.374, 0.218],
    [0.193, 0.001, 0.671, 4.218, 2.242, 0.195],
    [0.36, 0.472, 0.515, 4.102, 3.094, 0.163],
    [0.339, 0.527, 0.656, 4.801, 3.842, 0.157],
    [0.433, 0.211, 0.829, 4.053, 5.021, 0.188],
    [0.42, 0.401, 0.876, 4.612, 6.048, 0.182],
    [0.572, 0.133, 0.14, 4.31, 7.36, 0.219],
    [0.883, 0.957, 0.425, 4.86, 7.837, 0.182],
    [0.385, 0.122, 0.902, 4.596, 8.749, 0.229],
    [0.272, 0.334, 0.902, 4.013, 9.952, 0.199],
    [0.227, 0.843, 0.057, 4.652, 11.028, 0.189],
    [0.783, 0.739, 0.027, 4.782, 12.457, 0.206],
    [0.001, 0.557, 0.378, 4.641, 13.182, 0.231],
    [0.684, 0.521, 0.668, 4.993, 13.608, 0.225],
    [0.721, 0.803, 0.504, 4.064, 15.408, 0.202],
    [0.226, 0.536, 0.666, 4.029, 16.2, 0.234],
    [0.383, 0.907, 0.406, 4.534, 17.468, 0.161],
    [0.817, 0.42, 0.347, 5.973, -1.539, 0.238],
    [0.956, 0.454, 0.405, 5.166, -0.603, 0.219],
    [0.293, 0.854, 0.315, 5.443, -0.332, 0.242],
    [0.406, 0.391, 0.981, 5.42, 1.183, 0.202],
    [0.336, 0.379, 0.31, 5.643, 1.634, 0.237],
    [0.122, 0.268, 0.946, 5.213, 2.76, 0.17],
    [0.156, 0.771, 0.44, 5.547, 3.512, 0.191],
    [0.839, 0.961, 0.033, 5.468, 5.14, 0.164],
    [0.524, 0.863, 0.714, 5.954, 6.339, 0.193],
    [0.028, 0.161, 0.162, 5.331, 7.177, 0.16],
    [0.895, 0.198, 0.471, 5.345, 7.58, 0.223],
    [0.581, 0.637, 0.702, 5.238, 8.836, 0.188],
    [0.412, 0.683, 0.462, 5.082, 9.874, 0.25],
    [0.449, 0.635, 0.59, 5.235, 10.508, 0.24],
    [0.765, 0.112, 0.155, 5.112, 11.578, 0.164],
    [0.2, 0.591, 0.209, 5.522, 13.478, 0.154],
    [0.283, 0.781, 0.036, 5.278, 14.461, 0.152],
    [0.718, 0.002, 0.053, 5.3, 14.99, 0.153],
    [0.351, 0.346, 0.966, 5.417, 16.101, 0.221],
    [0.313, 0.612, 0.469, 5.931, 16.791, 0.158],
    [0.15, 0.3, 0.503, 6.246, -1.676, 0.193],
    [0.84, 0.169, 0.97, 6.981, -1.177, 0.152],
    [0.901, 0.713, 0.358, 6.269, 0.251, 0.192],
    [0.957, 0.288, 0.491, 6.054, 0.698, 0.194],
    [0.586, 0.606, 0.409, 6.529, 2.11, 0.201],
    [0.153, 0.119, 0.741, 6.895, 3.016, 0.194],
    [0.256, 0.013, 0.478, 6.445, 4.406, 0.237],
    [0.059, 0.145, 0.297, 6.9, 4.707, 0.194],
    [0.524, 0.558, 0.271, 6.308, 6.447, 0.224],
    [0.461, 0.501, 0.291, 6.486, 7.434, 0.196],
    [0.315, 0.354, 0.583, 6.968, 7.972, 0.242],
    [0.201, 0.41, 0.868, 6.246, 8.835, 0.162],
    [0.284, 0.622, 0.771, 6.454, 10.452, 0.216],
    [0.547, 0.394, 0.537, 6.409, 11.354, 0.221],
    [0.457, 0.465, 0.615, 6.64, 11.908, 0.181],
    [0.592, 0.688, 0.408, 6.519, 13.004, 0.158],
    [0.001, 0.227, 0.075, 6.519, 13.944, 0.207],
    [0.703, 0.309, 0.045, 6.219, 14.728, 0.18],
    [0.096, 0.798, 0.433, 6.78, 16.218, 0.155],
    [0.739, 0.055, 0.202, 6.893, 17.476, 0.223],
    [0.809, 0.074, 0.395, 7.345, -2.083, 0.21],
    [0.515, 0.244, 0.028, 7.597, -1.277, 0.185],
    [0.082, 0.226, 0.713, 7.576, 0.018, 0.168],
    [0.335, 0.564, 0.405, 7.809, 1.149, 0.209],
    [0.903, 0.351, 0.967, 7.952, 2.255, 0.245],
    [0.769, 0.737, 0.23, 7.027, 2.771, 0.177],
    [0.923, 0.756, 0.772, 7.646, 3.627, 0.184],
    [0.885, 0.67, 0.459, 7.257, 4.984, 0.198],
    [0.793, 0.802, 0.52, 7.111, 5.815, 0.186],
    [0.383, 0.385, 0.732, 7.171, 7.007, 0.24],
    [0.353, 0.542, 0.424, 7.731, 8.167, 0.213],
    [0.826, 0.368, 0.525, 7.6, 8.84, 0.183],
    [0.824, 0.718, 0.591, 7.366, 10.141, 0.166],
    [0.041, 0.958, 0.349, 7.196, 11.365, 0.226],
    [0.11, 0.995, 0.345, 7.771, 11.907, 0.166],
    [0.381, 0.586, 0.956, 7.876, 12.87, 0.195],
    [0.218, 0.642, 0.279, 7.006, 14.087, 0.224],
    [0.988, 0.375, 0.232, 7.003, 15.425, 0.21],
    [0.775, 0.285, 0.373, 7.608, 15.88, 0.17],
    [0.62, 0.974, 0.788, 7.026, 16.501, 0.183],
    [0.191, 0.636, 0.288, 8.743, -2.167, 0.188],
    [0.8, 0.79, 0.137, 8.143, -0.79, 0.229],
    [0.048, 0.864, 0.212, 8.423, -0.282, 0.163],
    [0.589, 0.702, 0.134, 8.728, 1.341, 0.15],
    [0.428, 0.288, 0.663, 8.113, 1.76, 0.217],
    [0.123, 0.614, 0.903, 8.221, 3.28, 0.248],
    [0.578, 0.39, 0.538, 8.747, 3.66, 0.182],
    [0.922, 0.484, 0.273, 8.447, 4.807, 0.16],
    [0.773, 0.737, 0.516, 8.983, 5.975, 0.179],
    [0.407, 0.76, 0.987, 8.052, 7.008, 0.192],
    [0.308, 0.84, 0.218, 8.665, 8.162, 0.225],
    [0.658, 0.172, 0.96, 8.356, 8.885, 0.231],
    [0.382, 0.338, 0.443, 8.643, 9.719, 0.188],
    [0.708, 0.549, 0.105, 8.832, 11.436, 0.223],
    [0.474, 0.813, 0.139, 8.082, 11.948, 0.202],
    [0.761, 0.961, 0.463, 8.883, 12.544, 0.223],
    [0.022, 0.772, 0.358, 8.233, 14.201, 0.232],
    [0.203, 0.955, 0.606, 8.866, 15.23, 0.225],
    [0.703, 0.605, 0.162, 8.245, 15.586, 0.158],
    [0.248, 0.251, 0.574, 8.663, 17.159, 0.175],
    [0.251, 0.578, 0.725, 9.456, -1.891, 0.196],
    [0.054, 0.971, 0.423, 9.503, -0.618, 0.199],
    [0.966, 0.616, 0.821, 9.263, 0.185, 0.156],
    [0.677, 0.158, 0.23, 9.312, 1.457, 0.158],
    [0.834, 0.024, 0.919, 9.095, 1.502, 0.207],
    [0.077, 0.912, 0.339, 9.351, 3.34, 0.189],
    [0.323, 0.484, 0.691, 9.389, 4.239, 0.17],
    [0.265, 0.282, 0.758, 9.253, 5.007, 0.154],
    [0.598, 0.17, 0.243, 9.056, 5.605, 0.219],
    [0.489, 0.375, 0.205, 9.27, 7.044, 0.162],
    [0.306, 0.026, 0.464, 9.582, 7.689, 0.187],
    [0.959, 0.976, 0.031, 9.726, 9.045, 0.207],
    [0.783, 0.846, 0.385, 9.381, 10.218, 0.216],
    [0.453, 0.726, 0.918, 9.815, 11.124, 0.185],
    [0.127, 0.596, 0.771, 9.976, 11.979, 0.241],
    [0.02, 0.739, 0.516, 9.372, 12.73, 0.193],
    [0.568, 0.696, 0.527, 9.358, 14.36, 0.165],
    [0.353, 0.995, 0.951, 9.784, 14.944, 0.224],
    [0.955, 0.813, 0.656, 9.822, 16.463, 0.181],
    [0.555, 0.839, 0.146, 9.17, 16.595, 0.159],
    [0.925, 0.599, 0.264, 10.734, -2.003, 0.223],
    [0.258, 0.385, 0.969, 10.269, -0.626, 0.229],
    [0.351, 0.987, 0.655, 10.882, -0.415, 0.196],
    [0.591, 0.803, 0.191, 10.801, 0.528, 0.244],
    [0.384, 0.157, 0.56, 10.626, 1.902, 0.206],
    [0.011, 0.621, 0.205, 10.518, 2.712, 0.163],
    [0.884, 0.514, 0.473, 10.113, 4.419, 0.204],
    [0.085, 0.974, 0.089, 10.842, 5.282, 0.192],
    [0.746, 0.916, 0.405, 10.495, 6.072, 0.212],
    [0.93, 0.551, 0.799, 10.256, 6.839, 0.24],
    [0.172, 0.017, 0.057, 10.106, 8.215, 0.215],
    [0.819, 0.647, 0.081, 10.764, 8.951, 0.216],
    [0.873, 0.306, 0.381, 10.163, 10.201, 0.152],
    [0.331, 0.928, 0.083, 10.521, 11.171, 0.161],
    [0.243, 0.814, 0.004, 10.263, 11.934, 0.231],
    [0.487, 0.637, 0.231, 10.649, 12.732, 0.222],
    [0.421, 0.699, 0.866, 10.019, 13.862, 0.158],
    [0.368, 0.297, 0.256, 10.961, 14.537, 0.153],
    [0.55, 0.766, 0.034, 10.676, 16.216, 0.162],
    [0.04, 0.976, 0.921, 10.988, 16.554, 0.166],
    [0.823, 0.109, 0.009, 11.002, -1.906, 0.152],
    [0.981, 0.057, 0.728, 11.495, -1.13, 0.23],
    [0.803, 0.654, 0.177, 11.857, -0.287, 0.186],
    [0.898, 0.815, 0.652, 11.682, 1.486, 0.195],
    [0.917, 0.798, 0.379, 11.187, 1.535, 0.157],
    [0.617, 0.654, 0.97, 11.761, 2.521, 0.176],
    [0.631, 0.288, 0.42, 11.486, 4.398, 0.162],
    [0.794, 0.794, 0.94, 11.056, 5.29, 0.172],
    [0.663, 0.679, 0.651, 11.934, 6.38, 0.156],
    [0.493, 0.917, 0.442, 11.899, 6.929, 0.221],
    [0.277, 0.032, 0.262, 11.581, 8.378, 0.164],
    [0.074, 0.391, 0.724, 11.746, 8.917, 0.16],
    [0.922, 0.626, 0.056, 11.999, 9.506, 0.231],
    [0.718, 0.669, 0.518, 11.739, 11.23, 0.234],
    [0.38, 0.279, 0.32, 11.939, 12.287, 0.198],
    [0.234, 0.737, 0.099, 11.51, 13.15, 0.211],
    [0.219, 0.246, 0.521, 11.195, 14.49, 0.203],
    [0.256, 0.284, 0.536, 11.042, 15.126, 0.205],
    [0.325, 0.655, 0.093, 11.598, 16.21, 0.222],
    [0.667, 0.156, 0.178, 11.186, 17.291, 0.212],
    [0.587, 0.589, 0.147, 12.967, -1.833, 0.247],
    [0.337, 0.989, 0.886, 12.638, -0.774, 0.236],
    [0.803, 0.277, 0.487, 12.639, 0.143, 0.17],
    [0.927, 0.374, 0.305, 12.081, 1.393, 0.161],
    [0.548, 0.537, 0.527, 12.455, 1.9, 0.184],
    [0.311, 0.781, 0.04, 12.776, 3.041, 0.155],
    [0.262, 0.707, 0.449, 12.834, 4.454, 0.231],
    [0.086, 0.877, 0.548, 12.279, 5.042, 0.228],
    [0.516, 0.116, 0.706, 12.603, 5.669, 0.216],
    [0.129, 0.965, 0.505, 12.877, 7.239, 0.248],
    [0.526, 0.566, 0.825, 12.01, 7.874, 0.203],
    [0.915, 0.386, 0.482, 12.113, 9.22, 0.233],
    [0.997, 0.492, 0.747, 12.529, 9.863, 0.157],
    [0.393, 0.158, 0.514, 12.781, 10.548, 0.225],
    [0.417, 0.255, 0.367, 12.408, 11.521, 0.199],
    [0.35, 0.049, 0.474, 12.254, 12.694, 0.219],
    [0.425, 0.101, 0.526, 12.235, 14.336, 0.158],
    [0.324, 0.94, 0.043, 12.515, 15.141, 0.239],
    [0.193, 0.895, 0.614, 12.001, 15.851, 0.177],
    [0.335, 0.927, 0.797, 12.408, 17.015, 0.161],
    [0.623, 0.267, 0.299, 13.011, -1.747, 0.197],
    [0.284, 0.853, 0.913, 13.872, -0.533, 0.223],
    [0.126, 0.643, 0.953, 13.302, -0.398, 0.177],
    [0.6, 0.033, 0.431, 13.152, 0.643, 0.177],
    [0.977, 0.031, 0.388, 13.728, 2.484, 0.178],
    [0.581, 0.746, 0.886, 13.713, 3.011, 0.185],
    [0.715, 0.261, 0.276, 13.911, 3.97, 0.193],
    [0.172, 0.545, 0.867, 13.32, 4.84, 0.17],
    [0.231, 0.727, 0.26, 13.768, 5.771, 0.184],
    [0.597, 0.951, 0.879, 13.69, 7.308, 0.244],
    [0.205, 0.489, 0.465, 13.466, 7.546, 0.198],
    [0.268, 0.667, 0.974, 13.55, 8.925, 0.195],
    [0.204, 0.897, 0.726, 13.727, 9.671, 0.212],
    [0.423, 0.63, 0.521, 13.685, 10.957, 0.165],
    [0.704, 0.389, 0.409, 13.613, 11.684, 0.159],
    [0.741, 0.284, 0.957, 13.613, 13.038, 0.164],
    [0.821, 0.52, 0.589, 13.441, 14.493, 0.169],
    [0.689, 0.845, 0.231, 13.222, 15.298, 0.169],
    [0.011, 0.414, 0.061, 13.687, 16.055, 0.169],
    [0.293, 0.069, 0.931, 13.007, 17.085, 0.217],
    [0.874, 0.963, 0.733, 14.328, -1.883, 0.215],
    [0.505, 0.68, 0.1, 14.122, -0.55, 0.235],
    [0.404, 0.777, 0.682, 14.622, -0.444, 0.171],
    [0.474, 0.37, 0.932, 14.947, 0.622, 0.22],
    [0.944, 0.504, 0.467, 14.898, 2.491, 0.192],
    [0.14, 0.721, 0.588, 14.491, 2.531, 0.165],
    [0.806, 0.43, 0.911, 14.793, 3.652, 0.247],
    [0.314, 0.359, 0.135, 14.667, 5.349, 0.22],
    [0.753, 0.57, 0.865, 14.053, 5.992, 0.172],
    [0.19, 0.528, 0.5, 14.147, 7.343, 0.182],
    [0.932, 0.684, 0.27, 14.763, 8.185, 0.246],
    [0.246, 0.417, 0.476, 14.42, 9.19, 0.156],
    [0.242, 0.995, 0.678, 14.275, 10.499, 0.224],
    [0.011, 0.825, 0.735, 14.194, 11.078, 0.249],
    [0.386, 0.304, 0.064, 14.357, 12.084, 0.198],
    [0.956, 0.368, 0.269, 14.982, 13.348, 0.208],
    [0.677, 0.083, 0.929, 14.682, 13.532, 0.187],
    [0.754, 0.413, 0.463, 14.375, 14.722, 0.228],
    [0.055, 0.81, 0.192, 14.703, 15.871, 0.18],
    [0.164, 0.294, 0.781, 14.267, 17.346, 0.179],
  ];
}
