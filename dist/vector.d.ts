export declare class Vector extends Float64Array {
    get x(): number;
    get y(): number;
    get z(): number;
    get radians(): number;
    get angle(): number;
    get degrees(): number;
    get grade(): number;
    abs_quad(): number;
    abs(): number;
    close_to(p: Iterable<number>, epsilon?: number): boolean;
    dot(p: Iterable<number>): number;
    cross(p: Iterable<number>): Vector;
    equals(p: Iterable<number>, epsilon?: number): boolean;
    angle_to(p: Iterable<number>): number;
    toString(): string;
    normal(): Vector;
    div(factor: number): Vector;
    mul(factor: number): Vector;
    add(that: Iterable<number>): Vector;
    sub(that: Iterable<number>): Vector;
    post_subtract(that: Iterable<number> | Vector): Vector;
    post_add(that: Iterable<number>): Vector;
    distance(p: Iterable<number>): number;
    normalize(): Vector;
    reflect_at(p: Iterable<number>): Vector;
    transform(matrix: any): Vector;
    flip_x(): Vector;
    flip_y(): Vector;
    flip_z(): Vector;
    shift_x(d: number): Vector;
    shift_y(d: number): Vector;
    shift_z(d: number): Vector;
    only_x(): Vector;
    only_y(): Vector;
    only_z(): Vector;
    with_x(n: number): Vector;
    with_y(n: number): Vector;
    with_z(n: number): Vector;
    rotated(rad: number): Vector;
    clone(): Vector;
    lerp(that: Vector, t: number): Vector;
    nearest_point_of_line(a: Iterable<number>, b: Iterable<number>): Vector;
    static new(x?: number[] | Iterable<number> | number | string, y?: number, z?: number): Vector;
    static vec(...args: number[]): Vector;
    static pos(x?: number, y?: number, z?: number): Vector;
    static polar(radius?: number, ϕ?: number, ϴ?: number): Vector;
    static radians(n: number, r?: number): Vector;
    static degrees(ϴ: number, r?: number): Vector;
    static grade(n: number, r?: number): Vector;
    static add(a: Iterable<number>, b: Iterable<number>): Vector;
    static subtract(a: Iterable<number>, b: Iterable<number>): Vector;
    static parse(s: string): Vector;
}
