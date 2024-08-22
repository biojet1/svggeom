import { Vector } from '../vector.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';
export declare class Quadratic extends SegmentSE {
    readonly c: Vector;
    constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>);
    private get _qpts();
    get length(): number;
    slopeAt(t: number): Vector;
    pointAt(t: number): Vector;
    splitAt(t: number): [SegmentSE, SegmentSE];
    bbox(): Box;
    toPathFragment(): (string | number)[];
    transform(M: any): Quadratic;
    reversed(): Quadratic;
}
export declare function quadSplitAt([[x1, y1], [cx, cy], [x2, y2]]: Vector[], t: number): Vector[][];
export declare function quadPointAt([[x1, y1], [cx, cy], [x2, y2]]: Vector[], t: number): Vector;
export declare function quadSlopeAt([from, c, to]: Vector[], t: number): Vector;
export declare function quadBBox([[x1, y1], [x2, y2], [x3, y3]]: Vector[]): Box;
export declare function quadLength([[x0, y0], [x1, y1], [x2, y2]]: Vector[], t?: number): number;
