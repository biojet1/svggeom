import { Vector } from '../vector.js';
import { BoundingBox } from '../bbox.js';
import { Segment, DescParams } from './index.js';
export declare abstract class SegmentLS extends Segment {
    _prev?: SegmentLS;
    protected readonly _to: Vector;
    static get digits(): number;
    static set digits(n: number);
    constructor(prev: SegmentLS | undefined, to: Vector);
    get prev(): SegmentLS;
    get from(): Vector;
    get to(): Vector;
    get first(): SegmentLS | undefined;
    get last_move(): MoveLS | undefined;
    walk(): Generator<SegmentLS, void, unknown>;
    move_to(...args: Iterable<number>[] | number[]): MoveLS;
    lineTo(...args: Iterable<number>[] | number[]): LineLS;
    closePath(): SegmentLS;
    bezierCurveTo(...args: Iterable<number>[] | number[]): CubicLS;
    quadraticCurveTo(...args: Iterable<number>[] | number[]): QuadLS;
    M(...args: Iterable<number>[] | number[]): MoveLS;
    m(...args: Iterable<number>[] | number[]): MoveLS;
    Z(): SegmentLS;
    z(): SegmentLS;
    L(...args: Iterable<number>[] | number[]): LineLS;
    l(...args: Iterable<number>[] | number[]): LineLS;
    H(n: number): LineLS;
    h(n: number): LineLS;
    V(n: number): LineLS;
    v(n: number): LineLS;
    Q(...args: Iterable<number>[] | number[]): QuadLS;
    q(...args: Iterable<number>[] | number[]): QuadLS;
    C(...args: Iterable<number>[] | number[]): CubicLS;
    c(...args: Iterable<number>[] | number[]): CubicLS;
    S(...args: Iterable<number>[] | number[]): CubicLS;
    s(...args: Iterable<number>[] | number[]): CubicLS;
    T(...args: Iterable<number>[] | number[]): QuadLS;
    t(...args: Iterable<number>[] | number[]): QuadLS;
    A(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, ...args: Iterable<number>[] | number[]): ArcLS;
    a(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, ...args: Iterable<number>[] | number[]): ArcLS;
    rect(...args: Iterable<number>[] | number[]): SegmentLS;
    arc(...args: Iterable<number>[] | number[]): SegmentLS;
    arcd(...args: Iterable<number>[] | number[]): SegmentLS;
    arcTo(...args: Iterable<number>[] | number[]): SegmentLS;
    toString(): string;
    describe(opt?: DescParams): string;
    terms(opt?: DescParams): (number | string)[];
    cut_at(t: number): SegmentLS;
    crop_at(t0: number, t1: number): SegmentLS | undefined;
    path_len(): number;
    segment_len(): number;
    bbox(): BoundingBox;
    with_far_prev(farPrev: SegmentLS, newPrev: SegmentLS): SegmentLS;
    with_far_prev_3(farPrev: SegmentLS, newPrev: SegmentLS | undefined): SegmentLS | undefined;
    as_curve(): SegmentLS;
    abstract term(opt?: DescParams): (number | string)[];
    abstract split_at(t: number): [SegmentLS, SegmentLS];
    abstract transform(M: any): SegmentLS;
    abstract reversed(next?: SegmentLS): SegmentLS | undefined;
    abstract with_prev(prev: SegmentLS | undefined): SegmentLS;
    parse(d: string): SegmentLS;
    static move_to(...args: Iterable<number>[] | number[] | Iterable<number>[]): MoveLS;
    static lineTo(...args: Iterable<number>[] | number[]): LineLS;
    static bezierCurveTo(...args: Iterable<number>[] | number[]): CubicLS;
    static quadraticCurveTo(...args: Iterable<number>[] | number[]): QuadLS;
    static parse(d: string): SegmentLS;
    static arc(...args: Iterable<number>[] | number[]): SegmentLS;
    static arcd(...args: Iterable<number>[] | number[]): SegmentLS;
    static arcTo(...args: Iterable<number>[] | number[]): SegmentLS;
    static rect(...args: Iterable<number>[] | number[]): SegmentLS;
}
export declare class LineLS extends SegmentLS {
    bbox(): BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(_: number): Vector;
    split_at(t: number): [SegmentLS, SegmentLS];
    term(opt?: DescParams): (string | number)[];
    reversed(next?: SegmentLS): SegmentLS | undefined;
    transform(M: any): LineLS;
    with_prev(newPrev: SegmentLS | undefined): LineLS;
}
export declare class MoveLS extends LineLS {
    term(opt?: DescParams): (string | number)[];
    split_at(t: number): [SegmentLS, SegmentLS];
    transform(M: any): MoveLS;
    reversed(next?: SegmentLS): SegmentLS | undefined;
    with_prev(prev: SegmentLS | undefined): MoveLS;
    segment_len(): number;
}
export declare class CloseLS extends LineLS {
    split_at(t: number): [SegmentLS, SegmentLS];
    transform(M: any): CloseLS;
    term(opt?: DescParams): (string | number)[];
    reversed(next?: SegmentLS): SegmentLS | undefined;
    with_prev(prev: SegmentLS | undefined): CloseLS;
}
export declare class QuadLS extends SegmentLS {
    readonly p: Vector;
    constructor(prev: SegmentLS | undefined, p: Vector, to: Vector);
    private get _qpts();
    get length(): number;
    slope_at(t: number): Vector;
    point_at(t: number): Vector;
    split_at(t: number): [SegmentLS, SegmentLS];
    bbox(): BoundingBox;
    term(opt?: DescParams): (string | number)[];
    reversed(next?: SegmentLS): SegmentLS | undefined;
    transform(M: any): QuadLS;
    with_prev(prev: SegmentLS | undefined): QuadLS;
}
export declare class CubicLS extends SegmentLS {
    readonly c1: Vector;
    readonly c2: Vector;
    constructor(prev: SegmentLS | undefined, c1: Vector, c2: Vector, to: Vector);
    private get _cpts();
    point_at(t: number): Vector;
    bbox(): BoundingBox;
    slope_at(t: number): Vector;
    split_at(t: number): [SegmentLS, SegmentLS];
    get length(): number;
    reversed(next?: SegmentLS): SegmentLS | undefined;
    transform(M: any): CubicLS;
    term(opt?: DescParams): (string | number)[];
    with_prev(prev: SegmentLS | undefined): CubicLS;
}
export declare class ArcLS extends SegmentLS {
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
    constructor(prev: SegmentLS | undefined, rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, to: Vector);
    bbox(): BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(t: number): Vector;
    split_at(t: number): [SegmentLS, SegmentLS];
    transform(M: any): ArcLS;
    reversed(next?: SegmentLS): SegmentLS | undefined;
    term(opt?: DescParams): (string | number)[];
    as_curve(): SegmentLS;
    with_prev(prev: SegmentLS | undefined): ArcLS;
}
