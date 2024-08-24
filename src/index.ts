export * from './vector.js';
export * from './ray.js';
export * from './bbox.js';
export * from './matrix.js';
export * from './svgtransform.js';
export { PathLS } from './draw.js';
export { SegmentLS } from './path/linked.js';
export { PathSE } from './path/segment/pathse.js';
export async function loadFont(which: string) {
	return import('./font.js').then(mod => mod.FontCache.getInstance().getFont(which));
}
