import * as regex from '../regex.js';
import { Point } from '../point.js';
import { Line, Close, Vertical, Horizontal } from './index.js';
import { Arc } from './arc.js';
import { Cubic } from './cubic.js';
import { Quadratic } from './quadratic.js';
function pathRegReplace(a, b, c, d) {
    return c + d.replace(regex.dots, ' .');
}
export function parseDesc(d) {
    const segments = new Array();
    const array = d
        .replace(regex.numbersWithDots, pathRegReplace)
        .replace(regex.pathLetters, ' $& ')
        .replace(regex.hyphen, '$1 -')
        .trim()
        .split(regex.delimiter)
        .reverse();
    let pos = Point.at();
    let moved = Point.at();
    let last_command;
    while (array.length > 0) {
        let absolute = false;
        const command = array.pop();
        const start = pos;
        switch (command) {
            case 'M':
                absolute = true;
            case 'm':
                {
                    const x = parseFloat(array.pop() || '0');
                    const y = parseFloat(array.pop() || '0');
                    if (absolute) {
                        pos = moved = Point.at(x, y);
                    }
                    else {
                        pos = moved = start.add(Point.at(x, y));
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
                    const x = parseFloat(array.pop() || '0');
                    const y = parseFloat(array.pop() || '0');
                    if (absolute) {
                        pos = Point.at(x, y);
                    }
                    else {
                        pos = pos.add(Point.at(x, y));
                    }
                    segments.push(new Line(start, pos));
                }
                break;
            case 'H':
                absolute = true;
            case 'h':
                {
                    const v = parseFloat(array.pop() || '0');
                    if (absolute) {
                        pos = Point.at(v, 0);
                    }
                    else {
                        pos = pos.add(Point.at(v, 0));
                    }
                    segments.push(new Horizontal(start, pos));
                }
                break;
            case 'V':
                absolute = true;
            case 'v':
                {
                    const v = parseFloat(array.pop() || '0');
                    if (absolute) {
                        pos = Point.at(0, v);
                    }
                    else {
                        pos = pos.add(Point.at(0, v));
                    }
                    segments.push(new Vertical(start, pos));
                }
                break;
            case 'A':
                absolute = true;
            case 'a':
                {
                    const rx = parseFloat(array.pop() || '0');
                    const ry = parseFloat(array.pop() || '0');
                    const rotation = parseFloat(array.pop() || '0');
                    const arc = parseFloat(array.pop() || '0');
                    const sweep = parseFloat(array.pop() || '0');
                    const x = parseFloat(array.pop() || '0');
                    const y = parseFloat(array.pop() || '0');
                    if (absolute) {
                        pos = Point.at(x, y);
                    }
                    else {
                        pos = pos.add(Point.at(x, y));
                    }
                    segments.push(Arc.fromEndPoint(start, rx, ry, rotation, arc, sweep, pos));
                }
                break;
            case 'C':
                absolute = true;
            case 'c':
                {
                    const c1x = parseFloat(array.pop() || '0');
                    const c1y = parseFloat(array.pop() || '0');
                    const c2x = parseFloat(array.pop() || '0');
                    const c2y = parseFloat(array.pop() || '0');
                    const x = parseFloat(array.pop() || '0');
                    const y = parseFloat(array.pop() || '0');
                    let c1 = Point.at(c1x, c1y);
                    let c2 = Point.at(c2x, c2y);
                    if (absolute) {
                        pos = Point.at(x, y);
                    }
                    else {
                        c1 = c1.add(pos);
                        c2 = c2.add(pos);
                        pos = pos.add(Point.at(x, y));
                    }
                    segments.push(new Cubic(start, c1, c2, pos));
                }
                break;
            case 'Q':
                absolute = true;
            case 'q':
                {
                    const cx = parseFloat(array.pop() || '0');
                    const cy = parseFloat(array.pop() || '0');
                    const x = parseFloat(array.pop() || '0');
                    const y = parseFloat(array.pop() || '0');
                    let con = Point.at(cx, cy);
                    if (absolute) {
                        pos = Point.at(x, y);
                    }
                    else {
                        con = con.add(pos);
                        pos = pos.add(Point.at(x, y));
                    }
                    segments.push(new Quadratic(start, con, pos));
                }
                break;
            case 'S':
                absolute = true;
            case 's':
                {
                    const cx = parseFloat(array.pop() || '0');
                    const cy = parseFloat(array.pop() || '0');
                    const x = parseFloat(array.pop() || '0');
                    const y = parseFloat(array.pop() || '0');
                    let c1;
                    const last = segments.length > 0 && segments[segments.length - 1];
                    if (last instanceof Cubic) {
                        c1 = last.c2.reflectAt(last.p2);
                    }
                    else {
                        c1 = start;
                    }
                    let c2 = Point.at(cx, cy);
                    if (absolute) {
                        pos = Point.at(x, y);
                    }
                    else {
                        c2 = c2.add(pos);
                        pos = start.add(Point.at(x, y));
                    }
                    segments.push(new Cubic(start, c1, c2, pos));
                }
                break;
            case 'T':
                absolute = true;
            case 't':
                {
                    const x = parseFloat(array.pop() || '0');
                    const y = parseFloat(array.pop() || '0');
                    let c;
                    const last = segments.length > 0 && segments[segments.length - 1];
                    if (last instanceof Quadratic) {
                        c = last.c.reflectAt(start);
                    }
                    else {
                        c = start;
                    }
                    if (absolute) {
                        pos = Point.at(x, y);
                    }
                    else {
                        pos = start.add(Point.at(x, y));
                    }
                    segments.push(new Quadratic(start, c, pos));
                }
                break;
            default:
                throw new Error(`Invalid command ${command} from "${d}"`);
        }
        last_command = command;
    }
    return segments;
}
