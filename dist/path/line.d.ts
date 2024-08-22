import { Vector } from '../vector.js';
import { Box } from '../box.js';
import { SegmentSE, DescParams } from './index.js';
declare abstract class LineSegment extends SegmentSE {
    bbox(): Box;
    get length(): number;
    pointAt(t: number): Vector;
    slopeAt(t: number): Vector;
    splitAt(t: number): [SegmentSE, SegmentSE];
    transform(M: any): LineSegment;
    reversed(): LineSegment;
    toPathFragment(opt?: DescParams): (string | number)[];
    abstract newFromTo(a: Vector, b: Vector): LineSegment;
}
export declare class Line extends LineSegment {
    constructor(from: Iterable<number>, to: Iterable<number>);
    newFromTo(a: Vector, b: Vector): Line;
}
export declare class Close extends Line {
    toPathFragment(): string[];
    toPath(): string;
    newFromTo(a: Vector, b: Vector): Close;
}
export declare class Horizontal extends Line {
}
export declare class Vertical extends Line {
}
export { Line as LineSegment };
