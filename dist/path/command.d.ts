import { DescParams } from './index.js';
import { BoundingBox } from "../bbox";
import { Vector } from "../vector";
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
    segment_len(): number;
    abstract split_at(t: number): [CommandLink, CommandLink];
    abstract transform(M: any): CommandLink;
    abstract reversed(next?: CommandLink): CommandLink | undefined;
    abstract with_prev(prev: CommandLink | undefined): CommandLink;
    abstract point_at(t: number): Vector;
    abstract get length(): number;
    abstract slope_at(t: number): Vector;
    abstract _descs(opt?: DescParams): (number | string)[];
    as_curve(): CommandLink;
    move_to(p: Iterable<number>): MoveCL;
    line_to(p: Iterable<number>): LineCL;
    curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicCL;
    quad_to(c: Iterable<number>, p: Iterable<number>): QuadCL;
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
    static curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): CubicCL;
    static quad_to(c: Iterable<number>, p: Iterable<number>): QuadCL;
    static parse(d: string): CommandLink;
}
export declare class LineCL extends CommandLink {
    bbox(): BoundingBox;
    get length(): number;
    point_at(t: number): Vector;
    slope_at(_: number): Vector;
    split_at(t: number): [CommandLink, CommandLink];
    _descs(opt?: DescParams): (string | number)[];
    reversed(next?: CommandLink): CommandLink | undefined;
    transform(M: any): LineCL;
    with_prev(newPrev: CommandLink | undefined): LineCL;
}
export declare class MoveCL extends LineCL {
    _descs(opt?: DescParams): (string | number)[];
    split_at(t: number): [CommandLink, CommandLink];
    transform(M: any): MoveCL;
    reversed(next?: CommandLink): CommandLink | undefined;
    with_prev(prev: CommandLink | undefined): MoveCL;
    segment_len(): number;
}
export declare class CloseCL extends LineCL {
    split_at(t: number): [CommandLink, CommandLink];
    transform(M: any): CloseCL;
    _descs(opt?: DescParams): (string | number)[];
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
    _descs(opt?: DescParams): (string | number)[];
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
    _descs(opt?: DescParams): (string | number)[];
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
    _descs(opt?: DescParams): (string | number)[];
    as_curve(): CommandLink;
    with_prev(prev: CommandLink | undefined): ArcCL;
}
