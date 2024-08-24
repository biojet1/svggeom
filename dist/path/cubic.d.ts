import { Vector } from '../vector.js';
export declare class Cubic extends SegmentSE {
    readonly c1: Vector;
    readonly c2: Vector;
    t_value?: number;
    constructor(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>);
    new(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>): Cubic;
    private get _cpts();
    bbox(): import("../bbox.js").BoundingBox;
    pointAt(t: number): Vector;
    splitAt(z: number): [SegmentSE, SegmentSE];
    get length(): number;
    slopeAt(t: number): Vector;
    toPathFragment(): (string | number)[];
    transform(M: any): Cubic;
    reversed(): Cubic;
}
export { Cubic as CubicSegment };
import { SegmentSE } from './segmentse.js';
