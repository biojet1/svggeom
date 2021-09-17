export declare class Point {
    readonly x: number;
    readonly y: number;
    private constructor();
    abs(): number;
    absQuad(): number;
    closeTo(p: Point, eta?: number): boolean;
    dot(p: Point): number;
    equals(p: Point): boolean;
    angleTo(p: Point): number;
    normal(): Point;
    div(factor: number): Point;
    add(p: Point): Point;
    sub(p: Point): Point;
    mul(factor: number): Point;
    normalize(): Point;
    reflectAt(p: Point): Point;
    transform(matrix: any): Point;
    clone(): Point;
    toArray(): number[];
    toPath(): string;
    toString(): string;
    static new(x?: number[] | Point | number, y?: any): Point;
    static at(x?: number, y?: number, z?: number): Point;
    static fromArray(v: number[]): Point;
}
