export * from './vector.js';
export * from './ray.js';
export * from './bbox.js';
export * from './matrix.js';
export * from './svgtransform.js';
export { PathLS } from './draw.js';
export { SegmentLS } from './path/linked.js';
export { PathSE } from './path/segment/pathse.js';
export declare function loadFont(which: string): Promise<import("opentype.js").Font>;
