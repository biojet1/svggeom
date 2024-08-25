import { DescParams } from './index.js';
import { BoundingBox } from "../bbox.js";
import { Vector } from "../vector.js";
export declare abstract class Command {
}
export declare abstract class BaseLC extends Command {
    _prev?: BaseLC;
    protected readonly _to: Vector;
    static get digits(): number;
    static set digits(n: number);
    constructor(prev: BaseLC | undefined, to: Vector);
    get prev(): BaseLC;
    get from(): Vector;
    get to(): Vector;
    get first(): BaseLC | undefined;
    get last_move(): BaseLC | undefined;
    bbox(): BoundingBox;
    abstract split_at(t: number): [BaseLC, BaseLC];
    abstract transform(M: any): BaseLC;
    abstract reversed(next?: BaseLC): BaseLC | undefined;
    abstract with_prev(prev: BaseLC | undefined): BaseLC;
    abstract point_at(t: number): Vector;
    abstract get length(): number;
    abstract slope_at(t: number): Vector;
    abstract term(opt?: DescParams): (number | string)[];
    cut_at(t: number): BaseLC;
    crop_at(t0: number, t1: number): BaseLC | undefined;
    path_len(): number;
    segment_len(): number;
    tangent_at(t: number): Vector;
    move_to(p: Iterable<number>): MoveLC;
    line_to(p: Iterable<number>): LineCL;
    curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicLC;
    quad_to(c: Iterable<number>, p: Iterable<number>): QuadLC;
    close(): BaseLC;
    arc_to(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, p: Iterable<number>): ArcLC;
    arc_centered_at(c: Iterable<number>, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): BaseLC;
    arc_tangent_to(p1: Iterable<number>, p2: Iterable<number>, r: number): BaseLC;
    lineTo(x: number, y: number): LineCL;
    moveTo(x: number, y: number): MoveLC;
    closePath(): BaseLC;
    quadraticCurveTo(cx: number, cy: number, px: number, py: number): QuadLC;
    bezierCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, px2: number, py2: number): CubicLC;
    arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): BaseLC;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): BaseLC;
    rect(x: number, y: number, w: number, h: number): BaseLC;
    toString(): string;
    terms(opt?: DescParams): (number | string)[];
    describe(opt?: DescParams): string;
    with_far_prev(farPrev: BaseLC, newPrev: BaseLC): BaseLC;
    with_far_prev_3(farPrev: BaseLC, newPrev: BaseLC | undefined): BaseLC | undefined;
    as_curve(): BaseLC;
    walk(): Generator<BaseLC, void, unknown>;
    M(p: Iterable<number>): MoveLC;
    m(p: Iterable<number>): MoveLC;
    Z(): BaseLC;
    z(): BaseLC;
    L(p: Iterable<number>): LineCL;
    l(p: Iterable<number>): LineCL;
    H(n: number): LineCL;
    h(n: number): LineCL;
    V(n: number): LineCL;
    v(n: number): LineCL;
    Q(c: Iterable<number>, p: Iterable<number>): QuadLC;
    q(c: Iterable<number>, p: Iterable<number>): QuadLC;
    C(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicLC;
    c(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicLC;
    S(c: Iterable<number>, p: Iterable<number>): CubicLC;
    s(c: Iterable<number>, p: Iterable<number>): CubicLC;
    T(p: Iterable<number>): QuadLC;
    t(p: Iterable<number>): QuadLC;
    A(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, p: Iterable<number>): ArcLC;
    a(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, p: Iterable<number>): ArcLC;
    static move_to(p: Iterable<number>): MoveLC;
    static line_to(p: Iterable<number>): LineCL;
    static lineTo(x: number, y: number): LineCL;
    static moveTo(x: number, y: number): MoveLC;
    static curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicLC;
    static quad_to(c: Iterable<number>, p: Iterable<number>): QuadLC;
    static arc_centered_at(c: Iterable<number>, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): BaseLC;
    static rect(x: number, y: number, w: number, h: number): BaseLC;
    static arc_tangent_to(p1: Iterable<number>, p2: Iterable<number>, r: number): BaseLC;
    static parse(d: string): BaseLC;
    static bezierCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, px2: number, py2: number): CubicLC;
    static quadraticCurveTo(cx: number, cy: number, px: number, py: number): QuadLC;
    static arcd(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): BaseLC;
}
export declare class LineCL extends BaseLC {
    bbox(): BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(_: number): Vector;
    split_at(t: number): [BaseLC, BaseLC];
    term(opt?: DescParams): (string | number)[];
    reversed(next?: BaseLC): BaseLC | undefined;
    transform(M: any): LineCL;
    with_prev(newPrev: BaseLC | undefined): LineCL;
}
export declare class MoveLC extends LineCL {
    term(opt?: DescParams): (string | number)[];
    split_at(t: number): [BaseLC, BaseLC];
    transform(M: any): MoveLC;
    reversed(next?: BaseLC): BaseLC | undefined;
    with_prev(prev: BaseLC | undefined): MoveLC;
    segment_len(): number;
}
export declare class CloseLC extends LineCL {
    split_at(t: number): [BaseLC, BaseLC];
    transform(M: any): CloseLC;
    term(opt?: DescParams): (string | number)[];
    reversed(next?: BaseLC): BaseLC | undefined;
    with_prev(prev: BaseLC | undefined): CloseLC;
}
export declare class QuadLC extends BaseLC {
    readonly p: Vector;
    constructor(prev: BaseLC | undefined, p: Vector, to: Vector);
    private get _qpts();
    get length(): number;
    slope_at(t: number): Vector;
    point_at(t: number): Vector;
    split_at(t: number): [BaseLC, BaseLC];
    bbox(): BoundingBox;
    term(opt?: DescParams): (string | number)[];
    reversed(next?: BaseLC): BaseLC | undefined;
    transform(M: any): QuadLC;
    with_prev(prev: BaseLC | undefined): QuadLC;
}
export declare class CubicLC extends BaseLC {
    readonly c1: Vector;
    readonly c2: Vector;
    constructor(prev: BaseLC | undefined, c1: Vector, c2: Vector, to: Vector);
    private get _cpts();
    point_at(t: number): Vector;
    bbox(): BoundingBox;
    slope_at(t: number): Vector;
    split_at(t: number): [BaseLC, BaseLC];
    get length(): number;
    reversed(next?: BaseLC): BaseLC | undefined;
    transform(M: any): CubicLC;
    term(opt?: DescParams): (string | number)[];
    with_prev(prev: BaseLC | undefined): CubicLC;
}
export declare class ArcLC extends BaseLC {
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
    constructor(prev: BaseLC | undefined, rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, to: Vector);
    bbox(): BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(t: number): Vector;
    split_at(t: number): [BaseLC, BaseLC];
    transform(M: any): ArcLC;
    reversed(next?: BaseLC): BaseLC | undefined;
    term(opt?: DescParams): (string | number)[];
    as_curve(): BaseLC;
    with_prev(prev: BaseLC | undefined): ArcLC;
}
