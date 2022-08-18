import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';
declare abstract class LineSegment extends SegmentSE {
    bbox(): Box;
    get length(): number;
    pointAt(t: number): Vec;
    slopeAt(t: number): Vec;
    splitAt(t: number): [SegmentSE, SegmentSE];
    transform(M: any): LineSegment;
    reversed(): LineSegment;
    toPathFragment(): (string | number)[];
    abstract newFromTo(a: Vec, b: Vec): LineSegment;
}
export declare class Line extends LineSegment {
    constructor(start: Iterable<number>, end: Iterable<number>);
    newFromTo(a: Vec, b: Vec): Line;
}
export declare class Close extends Line {
    toPathFragment(): string[];
    toPath(): string;
    newFromTo(a: Vec, b: Vec): Close;
}
export declare class Horizontal extends Line {
}
export declare class Vertical extends Line {
}
export { Line as LineSegment };
