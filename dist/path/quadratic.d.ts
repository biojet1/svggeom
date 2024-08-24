import { Vector } from '../vector.js';
import { SegmentSE } from './segmentse.js';
export declare class Quadratic extends SegmentSE {
    readonly c: Vector;
    constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>);
    private get _qpts();
    get length(): number;
    slopeAt(t: number): Vector;
    pointAt(t: number): Vector;
    splitAt(t: number): [SegmentSE, SegmentSE];
    bbox(): import("../bbox.js").BoundingBox;
    toPathFragment(): (string | number)[];
    transform(M: any): Quadratic;
    reversed(): Quadratic;
}
