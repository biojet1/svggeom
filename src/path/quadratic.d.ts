import { Point } from "../point.js";
import { Box } from "../box.js";
import { Cubic } from "./cubic.js";
export declare class Quadratic extends Cubic {
    readonly c: Point;
    constructor(start: Point | number[], control: Point | number[], end: Point | number[]);
    slopeAt(t: number): Point;
    pointAt(t: number): Point;
    splitAt(t: number): Quadratic[];
    bbox(): Box;
    toPathFragment(): (string | number)[];
    transform(M: any): Quadratic;
    reversed(): Quadratic;
}
