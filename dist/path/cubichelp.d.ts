import { BoundingBox } from '../bbox.js';
import { Vector } from '../vector.js';
export declare function cubic_extrema(s: number, a: number, b: number, e: number): number[];
export declare function cubic_box([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Vector[]): BoundingBox;
export declare function cubic_point_at([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], t: number): Vector;
export declare function cubic_split_at([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], z: number): number[][][];
export declare function cubic_slope_at([from, c1, c2, to]: Vector[], t: number): Vector;
export declare function cubic_length(_cpts: Iterable<number>[]): number;
