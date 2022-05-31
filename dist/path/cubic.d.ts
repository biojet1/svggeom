import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';
export declare class Cubic extends SegmentSE {
    readonly c1: Vec;
    readonly c2: Vec;
    t_value?: number;
    constructor(start: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>);
    new(start: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>): Cubic;
    bbox(): Box;
    flatness(): number;
    get length(): number;
    lengthAt(t?: number): number;
    makeFlat(t: number): Cubic[];
    pointAt(t: number): Vec;
    splitAt(z: number): Cubic[];
    splitAtScalar(z: number, start: number, end: number, p3: number, p4: number): [[number, number, number, number], [number, number, number, number]];
    toPathFragment(): (string | number)[];
    slopeAt(t: number): Vec;
    transform(M: any): Cubic;
    reversed(): Cubic;
}
export { Cubic as CubicSegment };
