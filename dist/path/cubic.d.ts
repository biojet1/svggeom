import { Vec } from '../point.js';
import { Box } from '../box.js';
export declare class Cubic extends SegmentSE {
    readonly c1: Vec;
    readonly c2: Vec;
    t_value?: number;
    constructor(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>);
    new(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>): Cubic;
    private get _cpts();
    bbox(): Box;
    pointAt(t: number): Vec;
    splitAt(z: number): [SegmentSE, SegmentSE];
    get length(): number;
    slopeAt(t: number): Vec;
    toPathFragment(): (string | number)[];
    transform(M: any): Cubic;
    reversed(): Cubic;
}
export { Cubic as CubicSegment };
export declare function cubicBox([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Vec[]): Box;
export declare function cubicPointAt([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], t: number): Vec;
export declare function cubicSplitAt([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], z: number): Vec[][];
export declare function cubicSlopeAt([from, c1, c2, to]: Vec[], t: number): Vec;
export declare function cubicLength(_cpts: Vec[]): number;
import { SegmentSE } from './index.js';
