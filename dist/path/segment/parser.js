import { Vector } from '../../vector.js';
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
function pathRegReplace(_a, _b, c, d) {
    return c + d.replace(dots, ' .');
}
export function dSplit(d) {
    return d
        .replace(numbersWithDots, pathRegReplace)
        .replace(pathLetters, ' $& ')
        .replace(hyphen, '$1 -')
        .trim()
        .split(delimiter);
}
export function parseDesc(d) {
    const segments = new Array();
    const array = dSplit(d).reverse();
    let pos = Vector.pos(0, 0);
    let moved = Vector.pos(0, 0);
    let last_command;
    const num = function () {
        const v = array.pop();
        if (v) {
            return parseFloat(v);
        }
        throw new Error(`Number expected '${v}' '${d}'`);
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
                        pos = moved = Vector.pos(x, y);
                    }
                    else {
                        pos = moved = start.add(Vector.pos(x, y));
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
                        pos = Vector.pos(x, y);
                    }
                    else {
                        pos = pos.add(Vector.pos(x, y));
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
                        pos = pos.with_x(v);
                    }
                    else {
                        pos = pos.shift_x(v);
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
                        pos = pos.with_y(v);
                    }
                    else {
                        pos = pos.shift_y(v);
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
                        pos = Vector.pos(x, y);
                    }
                    else {
                        pos = pos.add(Vector.pos(x, y));
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
                    let c1 = Vector.pos(c1x, c1y);
                    let c2 = Vector.pos(c2x, c2y);
                    if (absolute) {
                        pos = Vector.pos(x, y);
                    }
                    else {
                        c1 = c1.add(pos);
                        c2 = c2.add(pos);
                        pos = pos.add(Vector.pos(x, y));
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
                    let con = Vector.pos(cx, cy);
                    if (absolute) {
                        pos = Vector.pos(x, y);
                    }
                    else {
                        con = con.add(pos);
                        pos = pos.add(Vector.pos(x, y));
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
                        c1 = last.c2.reflect_at(last.to);
                    }
                    else {
                        c1 = start;
                    }
                    let c2 = Vector.pos(cx, cy);
                    if (absolute) {
                        pos = Vector.pos(x, y);
                    }
                    else {
                        c2 = c2.add(pos);
                        pos = start.add(Vector.pos(x, y));
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
                        c = last.c.reflect_at(start);
                    }
                    else {
                        c = start;
                    }
                    if (absolute) {
                        pos = Vector.pos(x, y);
                    }
                    else {
                        pos = start.add(Vector.pos(x, y));
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
import { SegmentLS } from '../linked.js';
export function parseLS(d, prev) {
    let mat;
    const dRE = /[\s,]*(?:([MmZzLlHhVvCcSsQqTtAa])|([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?))/y;
    const peek = function () {
        const i = dRE.lastIndex;
        const m = dRE.exec(d);
        dRE.lastIndex = i;
        return m;
    };
    const get = function () {
        const m = dRE.exec(d);
        return m;
    };
    const cmd = function () {
        const m = get();
        if (m) {
            const v = m[1];
            if (v) {
                return v;
            }
            throw new Error(`Command expected '${v}' '${d}'`);
        }
    };
    const num = function () {
        const v = get()?.[2];
        if (v) {
            return parseFloat(v);
        }
        throw new Error(`Number expected '${v}' '${d}'`);
    };
    const isNum = () => peek()?.[2];
    const vec = () => Vector.pos(num(), num());
    const first = SegmentLS.moveTo(Vector.pos(0, 0));
    let cur = prev ?? first;
    let command;
    while ((command = cmd())) {
        switch (command) {
            case 'M':
                cur = cur === first ? SegmentLS.moveTo(vec()) : cur.M(vec());
                while (isNum() && (cur = cur.L(vec())))
                    ;
                break;
            case 'm':
                cur = cur === first ? SegmentLS.moveTo(vec()) : cur.m(vec());
                while (isNum() && (cur = cur.l(vec())))
                    ;
                break;
            case 'Z':
            case 'z':
                cur === first || (cur = cur.Z());
                break;
            case 'L':
                while ((cur = cur.L(vec())) && isNum())
                    ;
                break;
            case 'l':
                while ((cur = cur.l(vec())) && isNum())
                    ;
                break;
            case 'H':
                while ((cur = cur.H(num())) && isNum())
                    ;
                break;
            case 'h':
                while ((cur = cur.h(num())) && isNum())
                    ;
                break;
            case 'V':
                while ((cur = cur.V(num())) && isNum())
                    ;
                break;
            case 'v':
                while ((cur = cur.v(num())) && isNum())
                    ;
                break;
            case 'Q':
                while ((cur = cur.Q(vec(), vec())) && isNum())
                    ;
                break;
            case 'q':
                while ((cur = cur.q(vec(), vec())) && isNum())
                    ;
                break;
            case 'C':
                while ((cur = cur.C(vec(), vec(), vec())) && isNum())
                    ;
                break;
            case 'c':
                while ((cur = cur.c(vec(), vec(), vec())) && isNum())
                    ;
                break;
            case 'S':
                while ((cur = cur.S(vec(), vec())) && isNum())
                    ;
                break;
            case 's':
                while ((cur = cur.s(vec(), vec())) && isNum())
                    ;
                break;
            case 'T':
                while ((cur = cur.T(vec())) && isNum())
                    ;
                break;
            case 't':
                while ((cur = cur.t(vec())) && isNum())
                    ;
                break;
            case 'A':
                while ((cur = cur.A(num(), num(), num(), num(), num(), vec())) && isNum())
                    ;
                break;
            case 'a':
                while ((cur = cur.a(num(), num(), num(), num(), num(), vec())) && isNum())
                    ;
                break;
            default:
                throw new Error(`Invalid path command ${command} from "${d}"`);
        }
    }
    return cur;
}
//# sourceMappingURL=parser.js.map