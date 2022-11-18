import { Color } from './tuples';
import { Canvas } from './canvas';

test('creating a Canvas', () => {
  const canvas = new Canvas(10, 20);

  expect(canvas.width).toBe(10);
  expect(canvas.height).toBe(20);
  expect(canvas.pixels[5][5]).toStrictEqual([0, 0, 0]);
});

test('writing pixels to a Canvas', () => {
  const canvas = new Canvas(10, 20);
  const red: Color = [1, 0, 0];

  canvas.pixels[2][3] = red;
  expect(canvas.pixels[2][3]).toStrictEqual(red);
});

// test('exporting as ImageData', () => {
//     const canvas = new Canvas(10, 20);

//     canvas.pixels[0][0] = [1, 0, 0];
//     canvas.pixels[5][5] = [2, 0, 0];
//     canvas.pixels[9][19] = [0, 0.5, 0];

//     const img = canvas.getImageData();

//     expect(img.data.length).toBe(800);
// });
