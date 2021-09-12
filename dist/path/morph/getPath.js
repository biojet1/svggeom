import { raiseError } from './utilities/errors';
import { parsePoints } from './operators/parsePoints';
import { _ } from './constants';
const selectorRegex = /^([#|\.]|path)/i;
/**
 * This function figures out what kind of source the path is coming from and converts
 * it to the appropriate array representation.
 * @param pathSource The source of the path. This can be string path data, a path
 *     element, or a string containing an HTML selector to a path element.
 */
export function convertToPathData(pathSource) {
    if (Array.isArray(pathSource)) {
        return { data: pathSource, stringData: _ };
    }
    let stringData;
    if (typeof pathSource === 'string' && selectorRegex.test(pathSource)) {
        pathSource = document.querySelector(pathSource);
    }
    else {
        stringData = pathSource;
    }
    if (typeof pathSource === 'string') {
        // at this point, it should be path data.
        return { data: parsePoints(pathSource), stringData };
    }
    const pathElement = pathSource;
    if (pathElement.tagName.toUpperCase() === 'PATH') {
        // path's can be converted to path data by reading the d property.
        stringData = pathElement.getAttribute('d');
        return { data: parsePoints(stringData), stringData };
    }
    // in case a non-supported element is passed, throw an error.
    return raiseError('Unsupported element ', pathElement.tagName);
}
