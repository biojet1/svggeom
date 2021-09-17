import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment, Line } from "./index.js";
export declare class Arc extends Segment {
    readonly rx: number;
    readonly ry: number;
    readonly phi: number;
    readonly arc: number;
    readonly sweep: number;
    readonly cosφ: number;
    readonly sinφ: number;
    readonly cen: Point;
    readonly rtheta: number;
    readonly rdelta: number;
    private constructor();
    static fromEndPoint(p1: any, rx: number, ry: number, φ: number, arc: boolean | number, sweep: boolean | number, p2: any): Segment;
    static fromCenterForm(c: Point, rx: number, ry: number, φ: number, θ: number, Δθ: number): Arc;
    bbox(): Box;
    clone(): Arc;
    get length(): number;
    pointAt(t: number): Point;
    splitAt(t: number): Arc[];
    toPathFragment(): (string | number)[];
    slopeAt(t: number): Point;
    transform(matrix: any): Arc;
    reversed(): Arc;
    asCubic(): Line[];
}
