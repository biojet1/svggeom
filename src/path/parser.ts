import { Vec } from '../point.js';
import { Segment } from './index.js';
import { Arc } from './arc.js';
import { Cubic } from './cubic.js';
import { Line, Close, Vertical, Horizontal } from './line.js';
import { Quadratic } from './quadratic.js';

// splits a transformation chain
export const transforms = /\)\s*,?\s*/;

// split at whitespace and comma
export const delimiter = /[\s,]+/;

// The following regex are used to parse the d attribute of a path

// Matches all hyphens which are not after an exponent
export const hyphen = /([^e])-/gi;

// Replaces and tests for all path letters
export const pathLetters = /[MLHVCSQTAZ]/gi;

// yes we need this one, too
export const isPathLetter = /[MLHVCSQTAZ]/i;

// matches 0.154.23.45
export const numbersWithDots = /((\d?\.\d+(?:e[+-]?\d+)?)((?:\.\d+(?:e[+-]?\d+)?)+))+/gi;

// matches .
export const dots = /\./g;

function pathRegReplace(a: any, b: any, c: any, d: any) {
	return c + d.replace(dots, ' .');
}

export function parseDesc(d: string) {
	// prepare for parsing
	const segments = new Array<Segment>();
	const array = d
		.replace(numbersWithDots, pathRegReplace) // convert 45.123.123 to 45.123 .123
		.replace(pathLetters, ' $& ') // put some room between letters and numbers
		.replace(hyphen, '$1 -') // add space before hyphen
		.trim() // trim
		.split(delimiter)
		.reverse(); // split into array
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
					} else {
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
					} else {
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
					} else {
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
					} else {
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
					} else {
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
					} else {
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
					} else {
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

					// Smooth curve. First control point is the "reflection" of
					// the second control point in the previous path.
					let c1;
					const last = segments.length > 0 && segments[segments.length - 1];
					if (last instanceof Cubic) {
						// The first control point is assumed to be the reflection of
						// the second control point on the previous command relative
						// to the current point.
						// control1 = pos + pos - segments[-1].control2
						// c1 = last.c2.reflectAt(pos);
						// c1 = last.c2.reflectAt(start);
						c1 = last.c2.reflectAt(last.end);
						// c1 = start.add(start.sub(last.c2));
					} else {
						c1 = start;
					}

					let c2 = Vec.at(cx, cy);

					if (absolute) {
						pos = Vec.at(x, y);
					} else {
						// c1 = c1.add(pos);
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
					} else {
						c = start;
					}
					if (absolute) {
						pos = Vec.at(x, y);
					} else {
						// c = c.add(start);
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
							} else {
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

import { SegmentLS, MoveLS, CubicLS, QuadLS } from './linked.js';

export function parseLS(d: string) {
	// prepare for parsing
	const array = d
		.replace(numbersWithDots, pathRegReplace) // convert 45.123.123 to 45.123 .123
		.replace(pathLetters, ' $& ') // put some room between letters and numbers
		.replace(hyphen, '$1 -') // add space before hyphen
		.trim() // trim
		.split(delimiter)
		.reverse(); // split into array
	const num = function () {
		const v = array.pop();
		if (!v) {
			throw new Error(`Number expected '${v}' '${d}'`);
		}
		return parseFloat(v);
	};
	const vec = function () {
		return Vec.pos(num(), num());
	};
	const init = Vec.pos(0, 0);
	const last = function () {
		return cur ?? (cur = SegmentLS.moveTo(init));
	};
	const vecr = function () {
		return cur.end.add(vec());
	};

	let moved: SegmentLS | undefined;
	const first = SegmentLS.moveTo(init);
	let cur = first;
	let last_command;
	L1: while (array.length > 0) {
		let absolute = false;
		const command = array.pop();
		// const start = pos;
		switch (command) {
			case 'M':
				if (cur === first) {
					cur = SegmentLS.moveTo(vec());
				} else {
					cur = cur.M(vec());
				}
				break;
			case 'm':
				if (cur === first) {
					cur = SegmentLS.moveTo(vec());
				} else {
					cur = cur.m(vec());
				}
				break;
			case 'Z':
			case 'z':
				if (cur === first) {
					// pass
				} else {
					cur = cur.Z();
				}
				break;
			case 'L':
				cur = cur.L(vec());
				break;
			case 'l':
				cur = cur.l(vec());
				break;
			case 'H':
				cur = cur.H(num());
				break;
			case 'h':
				cur = cur.h(num());
				break;
			case 'V':
				cur = cur.V(num());
				break;
			case 'v':
				cur = cur.v(num());
				break;
			case 'Q':
				cur = cur.Q(vec(), vec());
				break;
			case 'q':
				cur = cur.q(vec(), vec());
				break;
			case 'C':
				cur = cur.C(vec(), vec(), vec());
				break;
			case 'c':
				cur = cur.c(vec(), vec(), vec());
				break;
			case 'S':
				cur = cur.S(vec(), vec());
				break;
			case 's':
				cur = cur.s(vec(), vec());
				break;
			case 'T':
				cur = cur.T(vec());
				break;
			case 't':
				cur = cur.t(vec());
				break;
			case 'A':
				cur = cur.A(num(), num(), num(), num(), num(), vec());
				break;
			case 'a':
				cur = cur.A(num(), num(), num(), num(), num(), vec());
				break;
			default:
				if (command && /^-?\.?\d/.test(command)) {
					switch (last_command) {
						case 'm':
							cur = cur.l(parseFloat(command), num());
							continue L1;
						case 'M':
							cur = cur.L(parseFloat(command), num());
							continue L1;
					}
					continue;
				}
				throw new Error(`Invalid command ${command} from "${d}" : ${array.reverse()}`);
		}
		last_command = command;
	}
	return cur;
}
