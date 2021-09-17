export declare class Matrix {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    readonly d: number;
    readonly e: number;
    readonly f: number;
    private constructor();
    clone(): Matrix;
    inverse(): Matrix;
    multiply(m: Matrix): Matrix;
    rotate(ang: number, x?: number, y?: number): Matrix;
    scale(scaleX: number, scaleY?: number): Matrix;
    skew(x: number, y: number): Matrix;
    skewX(x: number): Matrix;
    skewY(y: number): Matrix;
    toString(): string;
    translate(x?: number, y?: number): Matrix;
    translateY(v: number): Matrix;
    translateX(v: number): Matrix;
    equals(other: Matrix, epsilon?: number): boolean;
    isURT(epsilon?: number): boolean;
    decompose(): {
        translateX: number;
        translateY: number;
        rotate: number;
        skewX: number;
        scaleX: any;
        scaleY: any;
    };
    toArray(): number[];
    describe(): string;
    static compose(dec: any): string;
    static hexad(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): Matrix;
    static fromArray(m: number[]): Matrix;
    static parse(d: string): Matrix;
    [shot: string]: any;
    static fromElement(node: ElementLike): Matrix;
    static new(first: number | number[] | string | Matrix | ElementLike): Matrix;
    static interpolate(A: number[] | string | Matrix | ElementLike, B: number[] | string | Matrix | ElementLike): (t: number) => Matrix;
    static translate(x?: number, y?: number): Matrix;
    static translateY(v: number): Matrix;
    static translateX(v: number): Matrix;
}
interface ElementLike {
    nodeType: number;
    getAttribute(name: string): null | string;
}
export {};
