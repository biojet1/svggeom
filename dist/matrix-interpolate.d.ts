import { Matrix } from './matrix.js';
import { Vec } from './point.js';
export declare class MatrixInterpolate {
    static par(...arg: Array<Transform>): Par;
    static seq(...arg: Array<Transform>): Seq;
    static translate(x: number | Iterable<number>, y?: number): Translate;
    static scale(sx: number, sy?: number): Scale;
    static rotate(θ: number): Rotate;
    static weight(n: number): Select;
    static anchor(x: number | Iterable<number>, y?: number): Select;
    static identity(): Identity;
    static translateX(n: number): Translate;
    static translateY(n: number): Translate;
    static scaleY(n: number): Scale;
    static scaleX(n: number): Scale;
    static parse(...args: any): Transform;
    at(t: number, M?: Matrix): Matrix;
}
declare class Transform {
    _weight?: number;
    _anchor?: Vec;
    weight(n: number): this;
    anchor(x: number | Iterable<number>, y?: number): this;
    at(t: number, m: Matrix): Matrix;
}
declare class Select extends Transform {
    private new;
    translate(x: number | Iterable<number>, y?: number): Transform;
    scale(n: number): Transform;
    rotate(θ: number): Transform;
}
declare class Translate extends Transform {
    _seg: Segment;
    constructor(x: number | Iterable<number> | Segment, y?: number);
    track(seg: Segment): void;
    at(t: number, m: Matrix): Matrix;
}
declare class Scale extends Transform {
    n: number[];
    constructor(sx: number, sy?: number);
    at(t: number, m: Matrix): Matrix;
}
declare class Rotate extends Transform {
    θ: number;
    constructor(θ: number);
    at(t: number, m: Matrix): Matrix;
}
declare class Identity extends Transform {
    at(t: number, m: Matrix): Matrix;
}
declare abstract class Transforms extends Transform {
    items: Array<Transform>;
    constructor(items: Array<Transform>);
}
declare class Seq extends Transforms {
    at(T: number, m: Matrix): Matrix;
}
declare class Par extends Transforms {
    at(T: number, m: Matrix): Matrix;
}
import { Cubic } from './path/cubic.js';
import { Segment } from './path/index.js';
export declare function cubicTrack(h1: Vec, h2: Vec | undefined, p1: Vec, p2?: Vec): Cubic;
export declare function MInterp(m1: Matrix, m2: Matrix): void;
export {};
