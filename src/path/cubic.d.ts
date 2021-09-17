import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment } from "./index.js";
export declare class Cubic extends Segment {
    readonly c1: Point;
    readonly c2: Point;
    t_value?: number;
    constructor(p1: Point | number[], c1: Point | number[], c2: Point | number[], p2: Point | number[]);
    bbox(): Box;
    flatness(): number;
    get length(): number;
    lengthAt(t?: number): number;
    makeFlat(t: number): Cubic[];
    pointAt(t: number): Point;
    splitAt(z: number): Cubic[];
    splitAtScalar(z: number, p1: number, p2: number, p3: number, p4: number): [[number, number, number, number], [number, number, number, number]];
    toPathFragment(): (string | number)[];
    slopeAt(t: number): Point;
    transform(M: any): Cubic;
    reversed(): Cubic;
}
