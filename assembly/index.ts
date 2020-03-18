import { log } from "./custom";

memory.grow(200);

export function dim(len: i32, alpha: i16): void {
    for (let i = 3; i < len; i += 4) {
        store<i16>(sizeof<i16>() * i, alpha);
    }
}

export function greyscale(width: i32, height: i32): void {
    let points = width * height * 4;
    for (let i = 0; i < points; i += 4) {
        let r = load<i16>(sizeof<i16>() * i);
        let g = load<i16>(sizeof<i16>() * (i + 1));
        let b = load<i16>(sizeof<i16>() * (i + 2));
        let grey = (r + g + b) / 3;
        store<i16>(sizeof<i16>() * i, grey);
        store<i16>(sizeof<i16>() * (i + 1), grey);
        store<i16>(sizeof<i16>() * (i + 2), grey);
    }
}

function xyToIndex(width: i32, x: i32, y: i32, xOffset: i32, yOffset: i32, colorOffset: i32): i32 {
    let pixelIndex = width * (y + yOffset) + x + xOffset;
    return sizeof<i16>() * (pixelIndex * 4 + colorOffset);
}

export function boxBlur(width: i32, height: i32): void {
    let factor = 9;
    for (let j = 1; j < height - 1; j += 1) {
        // y
        for (let i = 1; i < width - 1; i += 1) {
            // x
            let r = 0;
            let g = 0;
            let b = 0;
            r += load<i16>(xyToIndex(width, i, j, -1, -1, 0));
            r += load<i16>(xyToIndex(width, i, j, 0, -1, 0));
            r += load<i16>(xyToIndex(width, i, j, 1, -1, 0));

            r += load<i16>(xyToIndex(width, i, j, -1, 0, 0));
            r += load<i16>(xyToIndex(width, i, j, 0, 0, 0));
            r += load<i16>(xyToIndex(width, i, j, 1, 0, 0));

            r += load<i16>(xyToIndex(width, i, j, -1, 1, 0));
            r += load<i16>(xyToIndex(width, i, j, 0, 1, 0));
            r += load<i16>(xyToIndex(width, i, j, 1, 1, 0));

            g += load<i16>(xyToIndex(width, i, j, -1, -1, 1));
            g += load<i16>(xyToIndex(width, i, j, 0, -1, 1));
            g += load<i16>(xyToIndex(width, i, j, 1, -1, 1));

            g += load<i16>(xyToIndex(width, i, j, -1, 0, 1));
            g += load<i16>(xyToIndex(width, i, j, 0, 0, 1));
            g += load<i16>(xyToIndex(width, i, j, 1, 0, 1));

            g += load<i16>(xyToIndex(width, i, j, -1, 1, 1));
            g += load<i16>(xyToIndex(width, i, j, 0, 1, 1));
            g += load<i16>(xyToIndex(width, i, j, 1, 1, 1));

            b += load<i16>(xyToIndex(width, i, j, -1, -1, 2));
            b += load<i16>(xyToIndex(width, i, j, 0, -1, 2));
            b += load<i16>(xyToIndex(width, i, j, 1, -1, 2));

            b += load<i16>(xyToIndex(width, i, j, -1, 0, 2));
            b += load<i16>(xyToIndex(width, i, j, 0, 0, 2));
            b += load<i16>(xyToIndex(width, i, j, 1, 0, 2));

            b += load<i16>(xyToIndex(width, i, j, -1, 1, 2));
            b += load<i16>(xyToIndex(width, i, j, 0, 1, 2));
            b += load<i16>(xyToIndex(width, i, j, 1, 1, 2));

            store<i16>(xyToIndex(width, i, j, 0, 0, 0), r / factor);
            store<i16>(xyToIndex(width, i, j, 0, 0, 1), g / factor);
            store<i16>(xyToIndex(width, i, j, 0, 0, 2), b / factor);
        }
    }
}
