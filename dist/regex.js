export const transforms = /\)\s*,?\s*/;
export const delimiter = /[\s,]+/;
export const hyphen = /([^e])-/gi;
export const pathLetters = /[MLHVCSQTAZ]/gi;
export const isPathLetter = /[MLHVCSQTAZ]/i;
export const numbersWithDots = /((\d?\.\d+(?:e[+-]?\d+)?)((?:\.\d+(?:e[+-]?\d+)?)+))+/gi;
export const dots = /\./g;
