declare type NumOrVec = number | Iterable<number>;
export declare class PathData {
    _x0?: number;
    _y0?: number;
    _x1?: number;
    _y1?: number;
    _: string;
    static moveTo(a: NumOrVec, b?: number): PathData;
    moveTo(a: NumOrVec, b?: number): this;
    closePath(): this;
    lineTo(a: NumOrVec, b?: number): this;
    quadraticCurveTo(...args: NumOrVec[]): this;
    bezierCurveTo(...args: NumOrVec[]): this;
    rect(...args: NumOrVec[]): this;
    arcTo(...args: NumOrVec[]): this;
    arcd(...args: NumOrVec[]): this;
    arc(...args: NumOrVec[]): this;
    toString(): string;
}
export {};
