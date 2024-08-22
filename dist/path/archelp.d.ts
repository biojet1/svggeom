import { Vec } from "../point.js";
interface PointAt {
    pointAt(f: number): Vec;
}
export declare function segment_length(curve: PointAt, start: number, end: number, start_point: Vec, end_point: Vec, error?: number, min_depth?: number, depth?: number): number;
export declare function arc_params(x1: number, y1: number, rx: number, ry: number, φ: number, arc: boolean, sweep: boolean, x2: number, y2: number): number[];
export declare function arc_to_curve(rx: number, ry: number, cx: number, cy: number, sin_phi: number, cos_phi: number, theta1: number, delta_theta: number): number[][];
export {};
