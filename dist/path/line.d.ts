import { Segment } from './index.js';
import { Vec } from '../point.js';
import { Box } from '../box.js';
declare abstract class LineSegment extends Segment {
    bbox(): Box;
    get length(): number;
    pointAt(t: number): Vec;
    slopeAt(t: number): Vec;
    splitAt(t: number): Segment[];
    transform(M: any): LineSegment;
    reversed(): LineSegment;
    toPathFragment(): (string | number)[];
    abstract newFromTo(a: Vec, b: Vec): LineSegment;
}
export declare class Line extends LineSegment {
    private readonly _start;
    private readonly _end;
    constructor(start: Iterable<number>, end: Iterable<number>);
    get start(): Vec;
    get end(): Vec;
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
