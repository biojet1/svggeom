import * as regex from '../regex.js';
import {Point} from '../point.js';
import {Box} from '../box.js';
import {Segment, Line, Close, Vertical, Horizontal} from './index.js';
import {Arc} from './arc.js';
import {Cubic} from './cubic.js';
import {Quadratic} from './quadratic.js';

function pathRegReplace(a: any, b: any, c: any, d: any) {
	return c + d.replace(regex.dots, ' .');
}

export function parseDesc(d: string) {
	// prepare for parsing
	const segments = new Array<Segment>();
	const array = d
		.replace(regex.numbersWithDots, pathRegReplace) // convert 45.123.123 to 45.123 .123
		.replace(regex.pathLetters, ' $& ') // put some room between letters and numbers
		.replace(regex.hyphen, '$1 -') // add space before hyphen
		.trim() // trim
		.split(regex.delimiter)
		.reverse(); // split into array
	let pos = Point.at();
	let moved = Point.at();
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
						pos = moved = Point.at(x, y);
					} else {
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
					const x = num();
					const y = num();
					if (absolute) {
						pos = Point.at(x, y);
					} else {
						pos = pos.add(Point.at(x, y));
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
						pos = Point.at(v, pos.y);
					} else {
						pos = Point.at(pos.x + v, pos.y);
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
						pos = Point.at(pos.x, v);
					} else {
						pos = Point.at(pos.x, pos.y + v);
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
						pos = Point.at(x, y);
					} else {
						pos = pos.add(Point.at(x, y));
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
					let c1 = Point.at(c1x, c1y);
					let c2 = Point.at(c2x, c2y);
					if (absolute) {
						pos = Point.at(x, y);
					} else {
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
					const cx = num();
					const cy = num();
					const x = num();
					const y = num();
					let con = Point.at(cx, cy);
					if (absolute) {
						pos = Point.at(x, y);
					} else {
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
						c1 = last.c2.reflectAt(last.p2);
						// c1 = start.add(start.sub(last.c2));
					} else {
						c1 = start;
					}

					let c2 = Point.at(cx, cy);

					if (absolute) {
						pos = Point.at(x, y);
					} else {
						// c1 = c1.add(pos);
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
						pos = Point.at(x, y);
					} else {
						// c = c.add(start);
						pos = start.add(Point.at(x, y));
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
