export * from './point.js';
export * from './ray.js';
export * from './box.js';
export * from './matrix.js';
export * from './matrix-interpolate.js';
// export * from './path.js';
export {PathLS} from './draw.js';
export {SegmentLS} from './path/linked.js';

export async function loadFont(which: string) {
	return import('./font.js').then(mod => mod.FontCache.getInstance().getFont(which));
}
