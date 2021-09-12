import { interpolatePath } from './operators/interpolatePath';
import { Path } from './path';
/**
 * Returns a function to interpolate between the two path shapes.
 * @param left path data, CSS selector, or path element
 * @param right path data, CSS selector, or path element
 */
export function interpolate(paths, options) {
    return interpolatePath(paths.map((path) => new Path(path)), options || {});
}
