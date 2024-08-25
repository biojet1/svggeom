import { Vector } from '../vector.js';
import { BoundingBox } from '../bbox.js';
export interface DescParams {
    relative?: boolean;
    smooth?: boolean;
    short?: boolean;
    close?: boolean;
    dfix?: number;
}
export declare abstract class Segment {
    abstract get from(): Vector;
    abstract get to(): Vector;
    abstract get length(): number;
    abstract bbox(): BoundingBox;
    abstract point_at(t: number): Vector;
    abstract slope_at(t: number): Vector;
    tangent_at(t: number): Vector;
    toPath(): string;
    terms(opt?: DescParams): (string | number)[];
    toPathFragment(opt?: DescParams): (string | number)[];
}
export declare function tCheck(t: number): number;
export declare function tNorm(t: number): number;
export declare function pickPos(args: Iterable<number>[] | number[] | Iterable<number>[]): Generator<Vector, void, unknown>;
export declare function pickNum(args: Iterable<number>[] | number[]): Generator<number, void, unknown>;
