export declare class Vec extends Float64Array {
    get x(): number;
    get y(): number;
    get z(): number;
    get radians(): number;
    get angle(): number;
    get degrees(): number;
    get grade(): number;
    abs_quad(): number;
    abs(): number;
    closeTo(p: Iterable<number>, epsilon?: number): boolean;
    dot(p: Iterable<number>): number;
    cross(p: Iterable<number>): Vec;
    equals(p: Iterable<number>): boolean;
    angleTo(p: Iterable<number>): number;
    toString(): string;
    toArray(): number[];
    normal(): Vec;
    onlyX(): Vec;
    onlyY(): Vec;
    onlyZ(): Vec;
    withX(x: number): Vec;
    withY(y: number): Vec;
    withZ(z: number): Vec;
    div(factor: number): Vec;
    mul(factor: number): Vec;
    add(that: Iterable<number>): Vec;
    sub(that: Iterable<number>): Vec;
    post_subtract(that: Iterable<number> | Vec): Vec;
    post_add(that: Iterable<number>): Vec;
    distance(p: Iterable<number>): number;
    normalize(): Vec;
    reflectAt(p: Iterable<number>): Vec;
    transform(matrix: any): Vec;
    flipX(): Vec;
    flipY(): Vec;
    flipZ(): Vec;
    shiftX(d: number): Vec;
    shiftY(d: number): Vec;
    shiftZ(d: number): Vec;
    rotated(rad: number): Vec;
    clone(): Vec;
    nearestPointOfLine(a: Iterable<number>, b: Iterable<number>): Vec;
    final(): Readonly<Vec>;
    mut(): Vec;
    static new(x?: number[] | Iterable<number> | number | string, y?: number, z?: number): Vec;
    private static vec;
    static pos(x?: number, y?: number, z?: number): Vec;
    static polar(radius?: number, ϕ?: number, ϴ?: number): Vec;
    static radians(n: number, r?: number): Vec;
    static degrees(ϴ: number, r?: number): Vec;
    static grade(n: number, r?: number): Vec;
    static add(a: Iterable<number>, b: Iterable<number>): Vec;
    static subtract(a: Iterable<number>, b: Iterable<number>): Vec;
    static parse(s: string): Vec;
}
