import { Vec } from '../point.js';
import { Arc } from './arc.js';
import { Cubic } from './cubic.js';
import { Line, Close, Vertical, Horizontal } from './line.js';
import { Quadratic } from './quadratic.js';
export const transforms = /\)\s*,?\s*/;
export const delimiter = /[\s,]+/;
export const hyphen = /([^e])-/gi;
export const pathLetters = /[MLHVCSQTAZ]/gi;
export const isPathLetter = /[MLHVCSQTAZ]/i;
export const numbersWithDots = /((\d?\.\d+(?:e[+-]?\d+)?)((?:\.\d+(?:e[+-]?\d+)?)+))+/gi;
export const dots = /\./g;
function pathRegReplace(a, b, c, d) {
    return c + d.replace(dots, ' .');
}
export function parseDesc(d) {
    const segments = new Array();
    const array = d
        .replace(numbersWithDots, pathRegReplace)
        .replace(pathLetters, ' $& ')
        .replace(hyphen, '$1 -')
        .trim()
        .split(delimiter)
        .reverse();
    let pos = Vec.at(0, 0);
    let moved = Vec.at(0, 0);
    let last_command;
    const num = function () {
        const v = array.pop();
        if (!v) {
            throw new Error(`Number expected '${v}' '${d}'`);
        }
        return parseFloat(v);
    };
    while (array.length > 0) {
        let absolute = false;
        const command = array.pop();
        const start = pos;
        switch (command) {
            case 'M':
                absolute = true;
            case 'm':
                {
                    const x = num();
                    const y = num();
                    if (absolute) {
                        pos = moved = Vec.at(x, y);
                    }
                    else {
                        pos = moved = start.add(Vec.at(x, y));
                    }
                }
                break;
            case 'Z':
                absolute = true;
            case 'z':
                {
                    segments.push(new Close(start, (pos = moved)));
                }
                break;
            case 'L':
                absolute = true;
            case 'l':
                {
                    const x = num();
                    const y = num();
                    if (absolute) {
                        pos = Vec.at(x, y);
                    }
                    else {
                        pos = pos.add(Vec.at(x, y));
                    }
                    segments.push(new Line(start, pos));
                }
                break;
            case 'H':
                absolute = true;
            case 'h':
                {
                    const v = num();
                    if (absolute) {
                        pos = Vec.at(v, pos.y);
                    }
                    else {
                        pos = Vec.at(pos.x + v, pos.y);
                    }
                    segments.push(new Horizontal(start, pos));
                }
                break;
            case 'V':
                absolute = true;
            case 'v':
                {
                    const v = num();
                    if (absolute) {
                        pos = Vec.at(pos.x, v);
                    }
                    else {
                        pos = Vec.at(pos.x, pos.y + v);
                    }
                    segments.push(new Vertical(start, pos));
                }
                break;
            case 'A':
                absolute = true;
            case 'a':
                {
                    const rx = num();
                    const ry = num();
                    const rotation = num();
                    const arc = num();
                    const sweep = num();
                    const x = num();
                    const y = num();
                    if (absolute) {
                        pos = Vec.at(x, y);
                    }
                    else {
                        pos = pos.add(Vec.at(x, y));
                    }
                    segments.push(Arc.fromEndPoint(start, rx, ry, rotation, arc, sweep, pos));
                }
                break;
            case 'C':
                absolute = true;
            case 'c':
                {
                    const c1x = num();
                    const c1y = num();
                    const c2x = num();
                    const c2y = num();
                    const x = num();
                    const y = num();
                    let c1 = Vec.at(c1x, c1y);
                    let c2 = Vec.at(c2x, c2y);
                    if (absolute) {
                        pos = Vec.at(x, y);
                    }
                    else {
                        c1 = c1.add(pos);
                        c2 = c2.add(pos);
                        pos = pos.add(Vec.at(x, y));
                    }
                    segments.push(new Cubic(start, c1, c2, pos));
                }
                break;
            case 'Q':
                absolute = true;
            case 'q':
                {
                    const cx = num();
                    const cy = num();
                    const x = num();
                    const y = num();
                    let con = Vec.at(cx, cy);
                    if (absolute) {
                        pos = Vec.at(x, y);
                    }
                    else {
                        con = con.add(pos);
                        pos = pos.add(Vec.at(x, y));
                    }
                    segments.push(new Quadratic(start, con, pos));
                }
                break;
            case 'S':
                absolute = true;
            case 's':
                {
                    const cx = num();
                    const cy = num();
                    const x = num();
                    const y = num();
                    let c1;
                    const last = segments.length > 0 && segments[segments.length - 1];
                    if (last instanceof Cubic) {
                        c1 = last.c2.reflectAt(last.end);
                    }
                    else {
                        c1 = start;
                    }
                    let c2 = Vec.at(cx, cy);
                    if (absolute) {
                        pos = Vec.at(x, y);
                    }
                    else {
                        c2 = c2.add(pos);
                        pos = start.add(Vec.at(x, y));
                    }
                    segments.push(new Cubic(start, c1, c2, pos));
                }
                break;
            case 'T':
                absolute = true;
            case 't':
                {
                    const x = num();
                    const y = num();
                    let c;
                    const last = segments.length > 0 && segments[segments.length - 1];
                    if (last instanceof Quadratic) {
                        c = last.c.reflectAt(start);
                    }
                    else {
                        c = start;
                    }
                    if (absolute) {
                        pos = Vec.at(x, y);
                    }
                    else {
                        pos = start.add(Vec.at(x, y));
                    }
                    segments.push(new Quadratic(start, c, pos));
                }
                break;
            default:
                if (command && /^-?\.?\d/.test(command)) {
                    array.push(command);
                    switch (last_command) {
                        case 'm':
                            array.push('l');
                            break;
                        case 'M':
                            array.push('L');
                            break;
                        default:
                            if (last_command) {
                                array.push(last_command);
                            }
                            else {
                                array.push('L');
                            }
                    }
                    continue;
                }
                throw new Error(`Invalid command ${command} from "${d}" : ${array.reverse()}`);
        }
        last_command = command;
    }
    return segments;
}
//# sourceMappingURL=parser.js.map