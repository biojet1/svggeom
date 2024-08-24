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
    abstract pointAt(t: number): Vector;
    abstract slopeAt(t: number): Vector;
    toPath(): string;
    descArray(opt?: DescParams): (string | number)[];
    tangentAt(t: number): Vector;
    toPathFragment(opt?: DescParams): (string | number)[];
}
export declare function tCheck(t: number): number;
export declare function tNorm(t: number): number;
export declare function pickPos(args: Vector[] | number[]): Generator<Vector, void, unknown>;
export declare function pickNum(args: Vector[] | number[]): Generator<number, void, unknown>;
