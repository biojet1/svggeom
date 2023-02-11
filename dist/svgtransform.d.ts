import { Matrix } from './matrix.js';
export declare class SVGMatrix extends Matrix {
}
export declare class SVGTransform extends Matrix {
    static SVG_TRANSFORM_UNKNOWN: number;
    static SVG_TRANSFORM_MATRIX: number;
    static SVG_TRANSFORM_TRANSLATE: number;
    static SVG_TRANSFORM_SCALE: number;
    static SVG_TRANSFORM_ROTATE: number;
    static SVG_TRANSFORM_SKEWX: number;
    static SVG_TRANSFORM_SKEWY: number;
    type: number;
    angle?: number;
    get matrix(): this;
    setMatrix(m: Matrix): void;
    setTranslate(x: number, y: number): void;
    setScale(sx: number, sy: number): void;
    setRotate(angle: number, cx: number, cy: number): void;
    setSkewX(angle: number): void;
    setSkewY(angle: number): void;
}
