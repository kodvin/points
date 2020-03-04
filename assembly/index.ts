// The entry file of your WebAssembly module.
// 10_000 points wit 32 bit(4 bytes), 10_000^2 / 64_000(byte per page) == 25_000 pages

import { returnSquare } from './custom';

memory.grow(1);

export function getI16At(index: i32): i32 {
  return load<i16>(sizeof<i16>() * index);
}


export function setI16At(index: i32, value: i32): void {
  store<i16>(sizeof<i16>() * index, value);
}


export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function isCenterEqual(x1: i32, y1: i32,  x2: i32, y2: i32, x3: i32, y3: i32, x4: i32, y4: i32): bool {
  const xc1 = x1 + x2; 
  const yc1 = y1 + y2; 
  const xc2 = x3 + x4; 
  const yc2 = y3 + y4;
  return xc1 == xc2 && yc1 == yc2;
}

export function isDistanceSquaredEqual(x1: i32, y1: i32,  x2: i32, y2: i32, x3: i32, y3: i32, x4: i32, y4: i32): bool {
  let d1 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  let d2 = (x3 - x4) * (x3 - x4) + (y3 - y4) * (y3 - y4);

  return d1 == d2;
}

function getDistanceSquared(x1: i16, y1: i16, x2: i16, y2: i16): i16 {
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
};

export function findSquares(len: i32): i32 {
  let xs = new Array<i16>(len);
  let ys = new Array<i16>(len);
  for (let i:i32 = 0; i < len; i++) {
    xs[i] = getI16At(i * 2);
    ys[i] = getI16At(i * 2 + 1);
  }
  let pp = new Array<Array<i16>>(len * (len + 1) / 2);
  let count = 0;
        for (let i = 0; i < len; i++) {
            // point pair p1,p2 is same as p2,p1 that is why we start from i, +1 so that we eliminate p1,p1 pair
            for (let j = i + 1; j < len; j++) {
                let tmp = new Array<i16>(5);
                tmp[0] = xs[i];
                tmp[1] = ys[i];
                tmp[2] = xs[j];
                tmp[3] = ys[j];
                tmp[4] = getDistanceSquared(xs[i], ys[i], xs[j], ys[j]);
                pp[count] = tmp;
                count++;
            }
        }
  return 1;
}

export function find(len: i32): i32 {
  let count = 0;
  for(let i = 0; i < len; i++) {
    for(let j = i + 1; j < len; j++) {
      // start from i to avoid dublicates
      for(let k = i; k < len; k++) {
        for(let l = k + 1; l < len; l++) {
          if (i == k || j == k || i == l || j == l) continue;
          let x1 = getI16At(i * 2);
          let y1 = getI16At(i * 2 + 1);
          let x2 = getI16At(j * 2);
          let y2 = getI16At(j * 2 + 1);

          let x3 = getI16At(k * 2);
          let y3 = getI16At(k * 2 + 1);
          let x4 = getI16At(l * 2);
          let y4 = getI16At(l * 2 + 1);

          // must but not enough
          let isCEqual = isCenterEqual(x1, y1, x2, y2, x3, y3, x4, y4);
          if (isCEqual) {
            let isDEqual = isDistanceSquaredEqual(x1, y1, x2, y2, x3, y3, x4, y4);
            if (isDEqual) {
              setI16At(2 * len + count * 4, i);
              setI16At(2 * len + count * 4 + 1, j);
              setI16At(2 * len + count * 4 + 2, k);
              setI16At(2 * len + count * 4 + 3, l);
              count = count + 1;
              returnSquare(x1, y1, x2, y2, x3, y3, x4, y4);
            }
          }
        }
      }
    }
  }

  return count;
}
