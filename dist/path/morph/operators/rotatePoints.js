import { createNumberArray } from '../utilities/createNumberArray';
export function rotatePoints(ns, count) {
    const len = ns.length;
    const rightLen = len - count;
    const buffer = createNumberArray(count);
    let i;
    // write to a temporary buffer
    for (i = 0; i < count; i++) {
        buffer[i] = ns[i];
    }
    // overwrite from the starting point
    for (i = count; i < len; i++) {
        ns[i - count] = ns[i];
    }
    // write temporary buffer back in
    for (i = 0; i < count; i++) {
        ns[rightLen + i] = buffer[i];
    }
}
