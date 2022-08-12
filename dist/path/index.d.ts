import { Vec } from '../point.js';
import { Box } from '../box.js';
export declare abstract class Segment {
    abstract get start(): Vec;
    abstract get end(): Vec;
    abstract get length(): number;
    abstract bbox(): Box;
    abstract pointAt(t: number): Vec;
    abstract slopeAt(t: number): Vec;
    transform(M: any): Segment;
    toPathFragment(): (string | number)[];
    reversed(): Segment;
    splitAt(t: number): Segment[];
    get firstPoint(): Vec;
    get lastPoint(): Vec;
    toPath(): string;
    cutAt(t: number): Segment;
    tangentAt(t: number): Vec;
    cropAt(t0: number, t1: number): Segment | undefined;
}
export declare abstract class SegmentSE extends Segment {
    private readonly _start;
    private readonly _end;
    constructor(start: Iterable<number>, end: Iterable<number>);
    get start(): Vec;
    get end(): Vec;
}
