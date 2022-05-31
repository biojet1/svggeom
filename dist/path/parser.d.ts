import { Segment } from './index.js';
export declare const transforms: RegExp;
export declare const delimiter: RegExp;
export declare const hyphen: RegExp;
export declare const pathLetters: RegExp;
export declare const isPathLetter: RegExp;
export declare const numbersWithDots: RegExp;
export declare const dots: RegExp;
export declare function parseDesc(d: string): Segment[];
