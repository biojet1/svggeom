import { Vector } from '../../vector.js';
import { SegmentSE } from './segmentse.js';
import { Line } from './line.js';
import { Cubic } from './cubic.js';
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
    bbox(): import("../../bbox.js").BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(t: number): Vector;
    split_at(t: number): [SegmentSE, SegmentSE];
    toPathFragment(): (string | number)[];
    transform(matrix: any): Arc;
    reversed(): Arc;
    asCubic(): Cubic[] | Line[];
}
