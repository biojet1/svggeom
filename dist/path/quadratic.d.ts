import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';
export declare class Quadratic extends SegmentSE {
    readonly c: Vec;
    constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>);
    private get _qpts();
    get length(): number;
    slopeAt(t: number): Vec;
    pointAt(t: number): Vec;
    splitAt(t: number): [SegmentSE, SegmentSE];
    bbox(): Box;
    toPathFragment(): (string | number)[];
    transform(M: any): Quadratic;
    reversed(): Quadratic;
}
export declare function quadSplitAt([[x1, y1], [cx, cy], [x2, y2]]: Vec[], t: number): Vec[][];
export declare function quadPointAt([[x1, y1], [cx, cy], [x2, y2]]: Vec[], t: number): Vec;
export declare function quadSlopeAt([from, c, to]: Vec[], t: number): Vec;
export declare function quadBBox([[x1, y1], [x2, y2], [x3, y3]]: Vec[]): Box;
export declare function quadLength([[x0, y0], [x1, y1], [x2, y2]]: Vec[], t?: number): number;
