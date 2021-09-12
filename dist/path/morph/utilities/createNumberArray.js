import { isEdge } from './browser';
const arrayConstructor = isEdge ? Array : Float32Array;
export function createNumberArray(n) {
    return new arrayConstructor(n);
}
