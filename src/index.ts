export * from './vector.js';
export * from './ray.js';
export * from './bbox.js';
export * from './matrix.js';
export * from './svgtransform.js';
export { PathSE } from './path/segment/pathse.js';
import { PathLC } from './path/pathcl.js';
const { Unit } = PathLC;
export { PathLC as PathLS, Unit as SegmentLS, PathLC }


export async function loadFont(which: string) {
	return import('./font.js').then(mod => mod.FontCache.getInstance().getFont(which));
}
