import { Point } from '../point.js';
import { Box } from '../box.js';
export declare abstract class Segment {
    readonly p1: Point;
    readonly p2: Point;
    abstract get length(): number;
    abstract toPathFragment(): (string | number)[];
    abstract bbox(): Box;
    abstract pointAt(t: number): Point;
    abstract slopeAt(t: number): Point;
    abstract transform(M: any): Segment;
    abstract reversed(): Segment;
    abstract splitAt(t: number): Segment[];
    constructor(p1: Point, p2: Point);
    toPath(): string;
    cutAt(t: number): Segment;
    tangentAt(t: number): Point;
    cropAt(t0: number, t1: number): Segment | undefined;
}
export declare class Line extends Segment {
    constructor(p1: Point | number[], p2: Point | number[]);
    bbox(): Box;
    get length(): number;
    pointAt(t: number): Point;
    toPathFragment(): (string | number)[];
    slopeAt(t: number): Point;
    transform(M: any): Line;
    splitAt(t: number): Line[];
    reversed(): Line;
}
export declare class Close extends Line {
    toPathFragment(): string[];
    toPath(): string;
    transform(M: any): Close;
    splitAt(t: number): (Line | Close)[];
}
export declare class Horizontal extends Line {
}
export declare class Vertical extends Line {
}
