declare module 'svggeom/box' {
  export class Box {
      readonly x: number;
      readonly y: number;
      readonly height: number;
      readonly width: number;
      private static _not;
      private constructor();
      clone(): Box;
      get left(): number;
      get xMin(): number;
      get top(): number;
      get yMin(): number;
      get right(): number;
      get xMax(): number;
      get bottom(): number;
      get yMax(): number;
      get centerX(): number;
      get centerY(): number;
      merge(box: Box): Box;
      transform(m: any): Box;
      isValid(): boolean;
      static not(): {
          merge(box: Box): Box;
          transform(m: any): any;
          isValid(): boolean;
          readonly x: number;
          readonly y: number;
          readonly height: number;
          readonly width: number;
          clone(): Box;
          readonly left: number;
          readonly xMin: number;
          readonly top: number;
          readonly yMin: number;
          readonly right: number;
          readonly xMax: number;
          readonly bottom: number;
          readonly yMax: number;
          readonly centerX: number;
          readonly centerY: number;
      };
      static fromExtrema(x1: number, x2: number, y1: number, y2: number): Box;
      static fromRect(x: number, y: number, width: number, height: number): Box;
      static new(first?: number | number[] | string | Box): Box;
  }

}
declare module 'svggeom' {
  export * from "svggeom/box.js";
  export * from "svggeom/matrix.js";
  export * from "svggeom/path.js";
  export * from "svggeom/point.js";

}
declare module 'svggeom/matrix' {
  export class Matrix {
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
          scaleX: number;
          scaleY: number;
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

}
declare module 'svggeom/path/a2c' {
  export function a2c(x1: number, y1: number, x2: number, y2: number, fa: number, fs: number, rx: number, ry: number, phi: number): number[][];

}
declare module 'svggeom/path/arc' {
  import { Point } from "svggeom/point.js";
  import { Box } from "svggeom/box.js";
  import { Segment, Line } from "svggeom/path.js";
  export class Arc extends Segment {
      readonly rx: number;
      readonly ry: number;
      readonly phi: number;
      readonly arc: number;
      readonly sweep: number;
      readonly cosφ: number;
      readonly sinφ: number;
      readonly cen: Point;
      readonly rtheta: number;
      readonly rdelta: number;
      private constructor();
      static fromEndPoint(p1: any, rx: number, ry: number, φ: number, arc: boolean | number, sweep: boolean | number, p2: any): Segment;
      static fromCenterForm(c: Point, rx: number, ry: number, φ: number, θ: number, Δθ: number): Arc;
      bbox(): Box;
      clone(): Arc;
      get length(): number;
      pointAt(t: number): Point;
      splitAt(t: number): Arc[];
      toPathFragment(): (string | number)[];
      slopeAt(t: number): Point;
      transform(matrix: any): Arc;
      reversed(): Arc;
      asCubic(): Line[];
  }

}
declare module 'svggeom/path/cacl' {

}
declare module 'svggeom/path/cubic' {
  import { Point } from "svggeom/point.js";
  import { Box } from "svggeom/box.js";
  import { Segment } from "svggeom/path.js";
  export class Cubic extends Segment {
      readonly c1: Point;
      readonly c2: Point;
      t_value?: number;
      constructor(p1: Point | number[], c1: Point | number[], c2: Point | number[], p2: Point | number[]);
      bbox(): Box;
      flatness(): number;
      get length(): number;
      lengthAt(t?: number): number;
      makeFlat(t: number): Cubic[];
      pointAt(t: number): Point;
      splitAt(z: number): Cubic[];
      splitAtScalar(z: number, p1: number, p2: number, p3: number, p4: number): [[number, number, number, number], [number, number, number, number]];
      toPathFragment(): (string | number)[];
      slopeAt(t: number): Point;
      transform(M: any): Cubic;
      reversed(): Cubic;
  }

}
declare module 'svggeom/path' {
  import { Point } from 'svggeom/point.js';
  import { Box } from 'svggeom/box.js';
  export abstract class Segment {
      readonly p1: Point;
      readonly p2: Point;
      abstract get length(): number;
      abstract toPathFragment(): (string | number)[];
      abstract bbox(): Box;
      abstract pointAt(t: number): Point;
      abstract slopeAt(t: number): Point;
      abstract transform(M: any): Segment;
      abstract reversed(): Segment;
      abstract splitAt(t: number): Segment[];
      constructor(p1: Point, p2: Point);
      toPath(): string;
      cutAt(t: number): Segment;
      tangentAt(t: number): Point;
      cropAt(t0: number, t1: number): Segment | undefined;
  }
  export class Line extends Segment {
      constructor(p1: Point | number[], p2: Point | number[]);
      bbox(): Box;
      get length(): number;
      pointAt(t: number): Point;
      toPathFragment(): (string | number)[];
      slopeAt(t: number): Point;
      transform(M: any): Line;
      splitAt(t: number): Line[];
      reversed(): Line;
  }
  export class Close extends Line {
      toPathFragment(): string[];
      toPath(): string;
      transform(M: any): Close;
      splitAt(t: number): (Line | Close)[];
  }
  export class Horizontal extends Line {
  }
  export class Vertical extends Line {
  }

}
declare module 'svggeom/path/parser' {
  import { Segment } from "svggeom/path.js";
  export function parseDesc(d: string): Segment[];

}
declare module 'svggeom/path/quadratic' {
  import { Point } from "svggeom/point.js";
  import { Box } from "svggeom/box.js";
  import { Cubic } from "svggeom/path/cubic.js";
  export class Quadratic extends Cubic {
      readonly c: Point;
      constructor(start: Point | number[], control: Point | number[], end: Point | number[]);
      slopeAt(t: number): Point;
      pointAt(t: number): Point;
      splitAt(t: number): Quadratic[];
      bbox(): Box;
      toPathFragment(): (string | number)[];
      transform(M: any): Quadratic;
      reversed(): Quadratic;
  }

}
declare module 'svggeom/path' {
  import { Segment } from "svggeom/path.js";
  import { Box } from "svggeom/box.js";
  interface IDescOpt {
      relative?: boolean;
      close?: boolean | null;
      smooth?: boolean;
      short?: boolean;
  }
  export class Path {
      private _segs;
      private _length?;
      private _lengths?;
      private constructor();
      getTotalLength(): number | undefined;
      getBBox(): Box;
      get length(): number | undefined;
      bbox(): Box;
      private calcLength;
      private get lengths();
      get firstPoint(): import("svggeom/point.js").Point | undefined;
      get lastPoint(): import("svggeom/point.js").Point | undefined;
      segmentAt(T: number): [Segment | undefined, number, number];
      isContinuous(): boolean;
      isClosed(): boolean;
      tangentAt(T: number): import("svggeom/point.js").Point | undefined;
      slopeAt(T: number): import("svggeom/point.js").Point | undefined;
      pointAt(T: number): import("svggeom/point.js").Point | undefined;
      splitAt(T: number): Path[] | undefined;
      cutAt(T: number): Path;
      cropAt(T0: number, T1?: number): Path;
      transform(M: any): Path;
      reversed(): Path;
      private enumDesc;
      descArray(params?: IDescOpt): (number | "M" | "L" | "Z" | "C" | "A" | "Q" | "m" | "z" | "l" | "H" | "h" | "V" | "v" | "a" | "c" | "q" | "S" | "s" | "T" | "t")[];
      describe(params?: IDescOpt): string;
      enumSubPaths(): Generator<Path, void, unknown>;
      static parse(d: string): Path;
      static new(v?: Segment[] | string | Segment | Path): Path;
  }
  import { Line, Close } from "svggeom/path.js";
  import { Arc } from "svggeom/path/arc.js";
  import { Cubic } from "svggeom/path/cubic.js";
  import { Quadratic } from "svggeom/path/quadratic.js";
  export { Line, Arc, Cubic, Quadratic, Segment, Close };

}
declare module 'svggeom/point' {
  export class Point {
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

}
declare module 'svggeom/regex' {
  export const transforms: RegExp;
  export const delimiter: RegExp;
  export const hyphen: RegExp;
  export const pathLetters: RegExp;
  export const isPathLetter: RegExp;
  export const numbersWithDots: RegExp;
  export const dots: RegExp;

}
