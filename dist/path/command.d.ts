import { DescParams } from './index.js';
import { BoundingBox } from "../bbox.js";
import { Vector } from "../vector.js";
export declare abstract class Command {
}
export declare abstract class CommandLink extends Command {
    _prev?: CommandLink;
    protected readonly _to: Vector;
    static get digits(): number;
    static set digits(n: number);
    constructor(prev: CommandLink | undefined, to: Vector);
    get prev(): CommandLink;
    get from(): Vector;
    get to(): Vector;
    get first(): CommandLink | undefined;
    get last_move(): CommandLink | undefined;
    bbox(): BoundingBox;
    abstract split_at(t: number): [CommandLink, CommandLink];
    abstract transform(M: any): CommandLink;
    abstract reversed(next?: CommandLink): CommandLink | undefined;
    abstract with_prev(prev: CommandLink | undefined): CommandLink;
    abstract point_at(t: number): Vector;
    abstract get length(): number;
    abstract slope_at(t: number): Vector;
    abstract term(opt?: DescParams): (number | string)[];
    cut_at(t: number): CommandLink;
    crop_at(t0: number, t1: number): CommandLink | undefined;
    path_len(): number;
    segment_len(): number;
    tangent_at(t: number): Vector;
    move_to(p: Iterable<number>): MoveCL;
    line_to(p: Iterable<number>): LineCL;
    curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicCL;
    quad_to(c: Iterable<number>, p: Iterable<number>): QuadCL;
    close(): CommandLink;
    arc_to(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, p: Iterable<number>): ArcCL;
    arc_centered_at(c: Iterable<number>, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): CommandLink;
    arc_tangent_to(p1: Iterable<number>, p2: Iterable<number>, r: number): CommandLink;
    lineTo(x: number, y: number): LineCL;
    moveTo(x: number, y: number): MoveCL;
    closePath(): CommandLink;
    quadraticCurveTo(cx: number, cy: number, px: number, py: number): QuadCL;
    bezierCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, px2: number, py2: number): CubicCL;
    arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): CommandLink;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): CommandLink;
    rect(x: number, y: number, w: number, h: number): CommandLink;
    toString(): string;
    terms(opt?: DescParams): (number | string)[];
    describe(opt?: DescParams): string;
    with_far_prev(farPrev: CommandLink, newPrev: CommandLink): CommandLink;
    with_far_prev_3(farPrev: CommandLink, newPrev: CommandLink | undefined): CommandLink | undefined;
    as_curve(): CommandLink;
    walk(): Generator<CommandLink, void, unknown>;
    M(p: Iterable<number>): MoveCL;
    m(p: Iterable<number>): MoveCL;
    Z(): CommandLink;
    z(): CommandLink;
    L(p: Iterable<number>): LineCL;
    l(p: Iterable<number>): LineCL;
    H(n: number): LineCL;
    h(n: number): LineCL;
    V(n: number): LineCL;
    v(n: number): LineCL;
    Q(c: Iterable<number>, p: Iterable<number>): QuadCL;
    q(c: Iterable<number>, p: Iterable<number>): QuadCL;
    C(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicCL;
    c(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicCL;
    S(c: Iterable<number>, p: Iterable<number>): CubicCL;
    s(c: Iterable<number>, p: Iterable<number>): CubicCL;
    T(p: Iterable<number>): QuadCL;
    t(p: Iterable<number>): QuadCL;
    A(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, p: Iterable<number>): ArcCL;
    a(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, p: Iterable<number>): ArcCL;
    static move_to(p: Iterable<number>): MoveCL;
    static line_to(p: Iterable<number>): LineCL;
    static lineTo(x: number, y: number): LineCL;
    static curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicCL;
    static quad_to(c: Iterable<number>, p: Iterable<number>): QuadCL;
    static arc_centered_at(c: Iterable<number>, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): CommandLink;
    static rect(x: number, y: number, w: number, h: number): CommandLink;
    static arc_tangent_to(p1: Iterable<number>, p2: Iterable<number>, r: number): CommandLink;
    static parse(d: string): CommandLink;
    static bezierCurveTo(cx1: number, cy1: number, cx2: number, cy2: number, px2: number, py2: number): CubicCL;
    static quadraticCurveTo(cx: number, cy: number, px: number, py: number): QuadCL;
    static arcd(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): CommandLink;
}
export declare class LineCL extends CommandLink {
    bbox(): BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(_: number): Vector;
    split_at(t: number): [CommandLink, CommandLink];
    term(opt?: DescParams): (string | number)[];
    reversed(next?: CommandLink): CommandLink | undefined;
    transform(M: any): LineCL;
    with_prev(newPrev: CommandLink | undefined): LineCL;
}
export declare class MoveCL extends LineCL {
    term(opt?: DescParams): (string | number)[];
    split_at(t: number): [CommandLink, CommandLink];
    transform(M: any): MoveCL;
    reversed(next?: CommandLink): CommandLink | undefined;
    with_prev(prev: CommandLink | undefined): MoveCL;
    segment_len(): number;
}
export declare class CloseCL extends LineCL {
    split_at(t: number): [CommandLink, CommandLink];
    transform(M: any): CloseCL;
    term(opt?: DescParams): (string | number)[];
    reversed(next?: CommandLink): CommandLink | undefined;
    with_prev(prev: CommandLink | undefined): CloseCL;
}
export declare class QuadCL extends CommandLink {
    readonly p: Vector;
    constructor(prev: CommandLink | undefined, p: Vector, to: Vector);
    private get _qpts();
    get length(): number;
    slope_at(t: number): Vector;
    point_at(t: number): Vector;
    split_at(t: number): [CommandLink, CommandLink];
    bbox(): BoundingBox;
    term(opt?: DescParams): (string | number)[];
    reversed(next?: CommandLink): CommandLink | undefined;
    transform(M: any): QuadCL;
    with_prev(prev: CommandLink | undefined): QuadCL;
}
export declare class CubicCL extends CommandLink {
    readonly c1: Vector;
    readonly c2: Vector;
    constructor(prev: CommandLink | undefined, c1: Vector, c2: Vector, to: Vector);
    private get _cpts();
    point_at(t: number): Vector;
    bbox(): BoundingBox;
    slope_at(t: number): Vector;
    split_at(t: number): [CommandLink, CommandLink];
    get length(): number;
    reversed(next?: CommandLink): CommandLink | undefined;
    transform(M: any): CubicCL;
    term(opt?: DescParams): (string | number)[];
    with_prev(prev: CommandLink | undefined): CubicCL;
}
export declare class ArcCL extends CommandLink {
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
    constructor(prev: CommandLink | undefined, rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, to: Vector);
    bbox(): BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(t: number): Vector;
    split_at(t: number): [CommandLink, CommandLink];
    transform(M: any): ArcCL;
    reversed(next?: CommandLink): CommandLink | undefined;
    term(opt?: DescParams): (string | number)[];
    as_curve(): CommandLink;
    with_prev(prev: CommandLink | undefined): ArcCL;
}
