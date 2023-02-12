import { Matrix } from './matrix.js';
export declare class SVGMatrix extends Matrix {
}
export declare class SVGTransform extends Matrix {
    static readonly SVG_TRANSFORM_UNKNOWN = 0;
    static readonly SVG_TRANSFORM_MATRIX = 1;
    static readonly SVG_TRANSFORM_TRANSLATE = 2;
    static readonly SVG_TRANSFORM_SCALE = 3;
    static readonly SVG_TRANSFORM_ROTATE = 4;
    static readonly SVG_TRANSFORM_SKEWX = 5;
    static readonly SVG_TRANSFORM_SKEWY = 6;
    type: number;
    angle?: number;
    _tx?: number;
    _ty?: number;
    get matrix(): this;
    setMatrix(m: Matrix): void;
    setTranslate(x: number, y?: number): void;
    setScale(sx: number, sy?: number): void;
    setRotate(angle: number, cx?: number, cy?: number): void;
    setSkewX(angle: number): void;
    setSkewY(angle: number): void;
    toString(): string;
}
export declare class SVGTransformList extends Array<SVGTransform> {
    clear(): void;
    getItem(i: number): SVGTransform;
    removeItem(i: number): SVGTransform;
    appendItem(newItem: SVGTransform): SVGTransform;
    initialize(newItem: SVGTransform): SVGTransform;
    insertItemBefore(newItem: SVGTransform, i: number): void;
    replaceItem(newItem: SVGTransform, i: number): void;
    createSVGTransformFromMatrix(newItem: Matrix): SVGTransform;
    combine(): Matrix;
    consolidate(): SVGTransform;
    toString(): string;
    get numberOfItems(): number;
    parse(d: string): this;
    static parse(d: string): SVGTransformList;
}
