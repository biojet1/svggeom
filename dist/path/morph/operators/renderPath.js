import { SPACE, MOVE_CURSOR, DRAW_CURVE_CUBIC_BEZIER } from '../constants';
import { isString } from '../utilities/inspect';
import { round } from '../utilities/math';
/**
 * Converts poly-bezier data back to SVG Path data.
 * @param ns poly-bezier data
 */
export function renderPath(ns, formatter = round) {
    if (isString(ns)) {
        return ns;
    }
    let result = [];
    for (let i = 0; i < ns.length; i++) {
        const n = ns[i];
        result.push(MOVE_CURSOR, formatter(n[0]), formatter(n[1]), DRAW_CURVE_CUBIC_BEZIER);
        let lastResult;
        for (let f = 2; f < n.length; f += 6) {
            const p0 = formatter(n[f]);
            const p1 = formatter(n[f + 1]);
            const p2 = formatter(n[f + 2]);
            const p3 = formatter(n[f + 3]);
            const dx = formatter(n[f + 4]);
            const dy = formatter(n[f + 5]);
            // this comparision purposefully needs to coerce numbers and string interchangably
            // tslint:disable-next-line:triple-equals
            const isPoint = p0 == dx && p2 == dx && p1 == dy && p3 == dy;
            // prevent duplicate points from rendering
            // tslint:disable-next-line:triple-equals
            if (!isPoint || lastResult !=
                // tslint:disable-next-line:no-conditional-assignment
                (lastResult = ('' + p0 + p1 + p2 + p3 + dx + dy))) {
                result.push(p0, p1, p2, p3, dx, dy);
            }
        }
    }
    return result.join(SPACE);
}
