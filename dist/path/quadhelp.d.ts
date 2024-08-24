import { BoundingBox } from '../bbox.js';
import { Vector } from '../vector.js';
export declare function quadratic_extrema(a: number, b: number, c: number): number[];
export declare function quad_length([[x0, y0], [x1, y1], [x2, y2]]: Iterable<number>[], t?: number): number;
export declare function quad_split_at([[x1, y1], [cx, cy], [x2, y2]]: Vector[], t: number): Vector[][];
export declare function quad_point_at([[x1, y1], [cx, cy], [x2, y2]]: Vector[], t: number): Vector;
export declare function quad_slope_at([from, c, to]: Vector[], t: number): Vector;
export declare function quad_bbox([[x1, y1], [x2, y2], [x3, y3]]: Vector[]): BoundingBox;
