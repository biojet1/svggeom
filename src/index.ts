export * from './vector.js';
export * from './ray.js';
export * from './bbox.js';
export * from './matrix.js';
export * from './svgtransform.js';
import { PathLC } from './path/pathlc.js';
const { Unit } = PathLC;
export { PathLC as PathLS, Unit as SegmentLS }
export { PathLC } from './path/pathlc.js';
export async function loadFont(which: string) {
	return import('./font.js').then(mod => mod.FontCache.getInstance().getFont(which));
}
