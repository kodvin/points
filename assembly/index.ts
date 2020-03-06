import { log } from "./custom";

memory.grow(100);

export function dim(len: i32, alpha: i16): void {
    for (let i = 3; i < len; i += 4) {
        store<i16>(sizeof<i16>() * i, alpha);
    }
}
