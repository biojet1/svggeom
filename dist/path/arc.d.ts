import { Vector } from '../vector.js';
import { BoundingBox } from '../bbox.js';
import { SegmentSE } from './segmentse.js';
import { Line } from './line.js';
import { Cubic } from './cubic.js';
interface IArc {
    readonly from: Vector;
    readonly to: Vector;
    readonly rx: number;
    readonly ry: number;
    readonly phi: number;
    readonly bigArc: boolean;
    readonly sweep: boolean;
    readonly cosφ: number;
    readonly sinφ: number;
    readonly rtheta: number;
    readonly rdelta: number;
    readonly cx: number;
    readonly cy: number;
    pointAt(f: number): Vector;
}
export declare class Arc extends SegmentSE {
    readonly rx: number;
    readonly ry: number;
    readonly phi: number;
    readonly bigArc: boolean;
    readonly sweep: boolean;
    readonly cosφ: number;
    readonly sinφ: number;
    readonly rtheta: number;
    readonly rdelta: number;
    readonly cx: number;
    readonly cy: number;
    private constructor();
    static fromEndPoint(from: Iterable<number>, rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, to: Iterable<number>): Line | Arc;
    static fromCenterForm(c: Vector, rx: number, ry: number, φ: number, θ: number, Δθ: number): Arc;
    bbox(): BoundingBox;
    get length(): number;
    pointAt(t: number): Vector;
    slopeAt(t: number): Vector;
    splitAt(t: number): [SegmentSE, SegmentSE];
    toPathFragment(): (string | number)[];
    transform(matrix: any): Arc;
    reversed(): Arc;
    asCubic(): Cubic[] | Line[];
}
export declare function arcPointAt(arc: IArc, t: number): Vector;
export declare function arcBBox(arc: IArc): BoundingBox;
export declare function arcLength(arc: IArc): number;
export declare function arcSlopeAt(arc: IArc, t: number): Vector;
export declare function arcTransform(self: IArc, matrix: any): number[];
export {};
