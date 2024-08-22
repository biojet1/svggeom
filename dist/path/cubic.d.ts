import { Vector } from '../vector.js';
import { Box } from '../box.js';
export declare class Cubic extends SegmentSE {
    readonly c1: Vector;
    readonly c2: Vector;
    t_value?: number;
    constructor(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>);
    new(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>): Cubic;
    private get _cpts();
    bbox(): Box;
    pointAt(t: number): Vector;
    splitAt(z: number): [SegmentSE, SegmentSE];
    get length(): number;
    slopeAt(t: number): Vector;
    toPathFragment(): (string | number)[];
    transform(M: any): Cubic;
    reversed(): Cubic;
}
export { Cubic as CubicSegment };
export declare function cubicBox([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Vector[]): Box;
export declare function cubicPointAt([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], t: number): Vector;
export declare function cubicSplitAt([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], z: number): Vector[][];
export declare function cubicSlopeAt([from, c1, c2, to]: Vector[], t: number): Vector;
export declare function cubicLength(_cpts: Vector[]): number;
import { SegmentSE } from './index.js';
