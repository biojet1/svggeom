import { BoundingBox } from "../bbox.js";
import { Vector } from "../vector.js";
interface PointAt {
    point_at(f: number): Vector;
}
export declare function segment_length(curve: PointAt, start: number, end: number, start_point: Vector, end_point: Vector, error?: number, min_depth?: number, depth?: number): number;
export declare function arc_params(x1: number, y1: number, rx: number, ry: number, φ: number, arc: boolean, sweep: boolean, x2: number, y2: number): number[];
export declare function arc_to_curve(rx: number, ry: number, cx: number, cy: number, sin_phi: number, cos_phi: number, theta1: number, delta_theta: number): number[][];
export interface IArc {
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
    point_at(f: number): Vector;
}
export declare function arc_point_at(arc: IArc, t: number): Vector;
export declare function arc_bbox(arc: IArc): BoundingBox;
export declare function arc_length(arc: IArc): number;
export declare function arc_slope_at(arc: IArc, t: number): Vector;
export declare function arc_transform(self: IArc, matrix: any): number[];
export {};
