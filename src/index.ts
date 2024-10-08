export * from './vector.js';
export * from './ray.js';
export * from './bbox.js';
export * from './matrix.js';
export * from './svgtransform.js';
import { PathLC } from './path/pathlc.js';
import { BaseLC } from "./path/command.js";
export { PathLC as PathLS, BaseLC as SegmentLS }
export { PathLC } from './path/pathlc.js';
export async function loadFont(which: string) {
	return import('./font.js').then(mod => mod.FontCache.getInstance().getFont(which));
}
