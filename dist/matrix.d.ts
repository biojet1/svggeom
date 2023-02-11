export declare class Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    constructor(M?: Iterable<number>);
    get isIdentity(): boolean;
    get is2D(): boolean;
    toString(): string;
    clone(): Matrix;
    equals(other: Matrix, epsilon?: number): boolean;
    isURT(epsilon?: number): boolean;
    decompose(): {
        translateX: number;
        translateY: number;
        rotate: number;
        skewX: number;
        scaleX: number;
        scaleY: number;
        toString: () => string;
    };
    toArray(): number[];
    describe(): string;
    protected _set_hexad(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): this;
    protected _hexad(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): Matrix;
    _catSelf(m: Matrix): this;
    _postCatSelf(m: Matrix): this;
    _cat(m: Matrix): Matrix;
    _postCat(m: Matrix): Matrix;
    inverse(): Matrix;
    cat(m: Matrix): Matrix;
    postCat(m: Matrix): Matrix;
    translate(x?: number, y?: number): Matrix;
    translateY(v: number): Matrix;
    translateX(v: number): Matrix;
    scale(scaleX: number, scaleY?: number): Matrix;
    rotate(ang: number, x?: number, y?: number): Matrix;
    skew(x: number, y: number): Matrix;
    skewX(x: number): Matrix;
    skewY(y: number): Matrix;
    static hexad(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): Matrix;
    static fromArray(m: number[]): Matrix;
    static parse(d: string): Matrix;
    [shot: string]: any;
    static fromElement(node: ElementLike): Matrix;
    static new(first: number | number[] | string | Matrix | ElementLike): Matrix;
    static interpolate(A: number[] | string | Matrix | ElementLike, B: number[] | string | Matrix | ElementLike, opt?: any): (t: number) => Matrix;
    static translate(x?: number, y?: number): Matrix;
    static translateY(v: number): Matrix;
    static translateX(v: number): Matrix;
    static skew(x: number, y: number): Matrix;
    static skewX(x: number): Matrix;
    static skewY(y: number): Matrix;
    static rotate(ang: number, x?: number, y?: number): Matrix;
    static scale(scaleX: number, scaleY?: number): Matrix;
    static Identity: Matrix;
    static identity(): Matrix;
}
interface ElementLike {
    nodeType: number;
    getAttribute(name: string): null | string;
}
export declare class MatrixMut extends Matrix {
    protected setHexad(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): this;
    invertSelf(): this;
    catSelf(m: Matrix): this;
    postCatSelf(m: Matrix): this;
}
export {};
