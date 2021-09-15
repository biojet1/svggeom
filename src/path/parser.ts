import * as regex from "../regex.js";
import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment, Line, Close, Vertical, Horizontal } from "./index.js";
import { Arc } from "./arc.js";
import { Cubic } from "./cubic.js";
import { Quadratic } from "./quadratic.js";
// const pathHandlers: any = {
// 	M(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible?: boolean
// 	) {
// 		p.x = p0.x = c[0];
// 		p.y = p0.y = c[1];
// 		// this.moved = p.clone();

// 		// return new Move(p);
// 		return undefined;
// 	},
// 	L(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		const ret = new Line(p.clone(), Point.at(c[0], c[1])); // .offset(o)
// 		p.x = c[0];
// 		p.y = c[1];
// 		return ret;
// 	},
// 	H(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		return pathHandlers.L([c[0], p.y], p, r, p0, reflectionIsPossible);
// 	},
// 	V(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		return pathHandlers.L([p.x, c[0]], p, r, p0, reflectionIsPossible);
// 	},
// 	Q(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		// const ret = Cubic.fromQuad(p, Point.at(c[0], c[1]), Point.at(c[2], c[3])); // .offset(o)
// 		const ret = new Quadratic(
// 			p,
// 			Point.at(c[0], c[1]),
// 			Point.at(c[2], c[3])
// 		); // .offset(o)
// 		p.x = c[2];
// 		p.y = c[3];

// 		const reflect = Point.at(c[0], c[1]).reflectAt(p);
// 		r.x = reflect.x;
// 		r.y = reflect.y;

// 		return ret;
// 	},
// 	T(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		if (reflectionIsPossible) {
// 			c = [r.x, r.y].concat(c);
// 		} else {
// 			c = [p.x, p.y].concat(c);
// 		}
// 		return pathHandlers.Q(c, p, r, p0, reflectionIsPossible);
// 	},
// 	C(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		const ret = new Cubic(
// 			p,
// 			Point.at(c[0], c[1]),
// 			Point.at(c[2], c[3]),
// 			Point.at(c[4], c[5])
// 		); // .offset(o)
// 		p.x = c[4];
// 		p.y = c[5];
// 		const reflect = Point.at(c[2], c[3]).reflectAt(p);
// 		r.x = reflect.x;
// 		r.y = reflect.y;
// 		return ret;
// 	},
// 	S(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		// reflection makes only sense if this command was preceeded by another beziere command (QTSC)
// 		if (reflectionIsPossible) {
// 			c = [r.x, r.y].concat(c);
// 		} else {
// 			c = [p.x, p.y].concat(c);
// 		}
// 		return pathHandlers.C(c, p, r, p0, reflectionIsPossible);
// 	},
// 	Z(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		if (!p0.equals(p)) {
// 			const z = new Close(p.clone(), p0.clone()); // .offset(o)
// 			p.x = p0.x;
// 			p.y = p0.y;
// 			return z;

// 			// return pathHandlers.L([p0.x, p0.y], p);
// 		}

// 		// FIXME: The behavior of Z depends on the command before
// 		// return pathHandlers.L([p0.x, p0.y], p);
// 	},
// 	A(
// 		c: number[],
// 		p: Point,
// 		r: Point,
// 		p0: Point,
// 		reflectionIsPossible: boolean
// 	) {
// 		const ret = Arc.fromEndPoint(
// 			p,
// 			c[0],
// 			c[1],
// 			c[2],
// 			c[3],
// 			c[4],
// 			Point.at(c[5], c[6])
// 		);
// 		p.x = c[5];
// 		p.y = c[6];
// 		return ret;
// 	},
// };

// const mlhvqtcsa = "mlhvqtcsaz".split("");

// for (let i = 0, il = mlhvqtcsa.length; i < il; ++i) {
// 	pathHandlers[mlhvqtcsa[i]] = (function (i) {
// 		return function (
// 			c: number[],
// 			p: Point,
// 			r: Point,
// 			p0: Point,
// 			reflectionIsPossible: boolean
// 		) {
// 			if (i === "H") c[0] = c[0] + p.x;
// 			else if (i === "V") c[0] = c[0] + p.y;
// 			else if (i === "A") {
// 				c[5] = c[5] + p.x;
// 				c[6] = c[6] + p.y;
// 			} else {
// 				for (let j = 0, jl = c.length; j < jl; ++j) {
// 					c[j] = c[j] + (j % 2 ? p.y : p.x);
// 				}
// 			}

// 			return pathHandlers[i](c, p, r, p0, reflectionIsPossible);
// 		};
// 	})(mlhvqtcsa[i].toUpperCase());
// }

function pathRegReplace(a: any, b: any, c: any, d: any) {
	return c + d.replace(regex.dots, " .");
}

// function isBeziere(obj: Segment) {
// 	return obj instanceof Cubic;
// }

// export function pathParser(d: string, arr: Array<Segment> = []) {
// 	// prepare for parsing
// 	const paramCnt: any = {
// 		M: 2,
// 		L: 2,
// 		H: 1,
// 		V: 1,
// 		C: 6,
// 		S: 4,
// 		Q: 4,
// 		T: 2,
// 		A: 7,
// 		Z: 0,
// 	};

// 	const array = d
// 		.replace(regex.numbersWithDots, pathRegReplace) // convert 45.123.123 to 45.123 .123
// 		.replace(regex.pathLetters, " $& ") // put some room between letters and numbers
// 		.replace(regex.hyphen, "$1 -") // add space before hyphen
// 		.trim() // trim
// 		.split(regex.delimiter); // split into array

// 	const p = Point.at();
// 	const p0 = Point.at();
// 	const r = Point.at();
// 	const len = array.length;
// 	let index = 0;
// 	let s = "";
// 	// console.error('pathParser', d, array);

// 	do {
// 		// Test if we have a path letter
// 		if (regex.isPathLetter.test(array[index])) {
// 			s = array[index];
// 			++index;
// 			// If last letter was a move command and we got no new, it defaults to [L]ine
// 		} else if (s === "M") {
// 			s = "L";
// 		} else if (s === "m") {
// 			s = "l";
// 		}
// 		const seg = pathHandlers[s].call(
// 			null,
// 			array
// 				.slice(index, (index = index + paramCnt[s.toUpperCase()] || 0))
// 				.map(parseFloat),
// 			p,
// 			r,
// 			p0,
// 			isBeziere(arr[arr.length - 1])
// 		);
// 		seg && arr.push(seg);
// 	} while (len > index);

// 	return arr;
// }

export function parseDesc(d: string) {
	// prepare for parsing
	const segments = new Array<Segment>();
	const array = d
		.replace(regex.numbersWithDots, pathRegReplace) // convert 45.123.123 to 45.123 .123
		.replace(regex.pathLetters, " $& ") // put some room between letters and numbers
		.replace(regex.hyphen, "$1 -") // add space before hyphen
		.trim() // trim
		.split(regex.delimiter)
		.reverse(); // split into array
	let pos = Point.at();
	let moved = Point.at();
	let last_command;

	while (array.length > 0) {
		let absolute = false;
		const command = array.pop();
		const start = pos;

		switch (command) {
			case "M":
				absolute = true;
			case "m":
				{
					const x = parseFloat(array.pop() || "0");
					const y = parseFloat(array.pop() || "0");
					if (absolute) {
						pos = moved = Point.at(x, y);
					} else {
						pos = moved = start.add(Point.at(x, y));
					}
				}
				break;
			case "Z":
				absolute = true;
			case "z":
				{
					segments.push(new Close(start, (pos = moved)));
				}
				break;
			case "L":
				absolute = true;
			case "l":
				{
					const x = parseFloat(array.pop() || "0");
					const y = parseFloat(array.pop() || "0");
					if (absolute) {
						pos = Point.at(x, y);
					} else {
						pos = pos.add(Point.at(x, y));
					}
					segments.push(new Line(start, pos));
				}
				break;
			case "H":
				absolute = true;
			case "h":
				{
					const v = parseFloat(array.pop() || "0");
					if (absolute) {
						pos = Point.at(v, pos.y);
					} else {
						pos = Point.at(pos.x + v, pos.y);
					}
					segments.push(new Horizontal(start, pos));
				}
				break;
			case "V":
				absolute = true;
			case "v":
				{
					const v = parseFloat(array.pop() || "0");
					if (absolute) {
						pos = Point.at(pos.x, v);
					} else {
						pos = Point.at(pos.x, pos.y + v);
					}
					segments.push(new Vertical(start, pos));
				}
				break;
			case "A":
				absolute = true;
			case "a":
				{
					const rx = parseFloat(array.pop() || "0");
					const ry = parseFloat(array.pop() || "0");
					const rotation = parseFloat(array.pop() || "0");
					const arc = parseFloat(array.pop() || "0");
					const sweep = parseFloat(array.pop() || "0");
					const x = parseFloat(array.pop() || "0");
					const y = parseFloat(array.pop() || "0");
					if (absolute) {
						pos = Point.at(x, y);
					} else {
						pos = pos.add(Point.at(x, y));
					}

					segments.push(
						Arc.fromEndPoint(
							start,
							rx,
							ry,
							rotation,
							arc,
							sweep,
							pos
						)
					);
				}
				break;
			case "C":
				absolute = true;
			case "c":
				{
					const c1x = parseFloat(array.pop() || "0");
					const c1y = parseFloat(array.pop() || "0");
					const c2x = parseFloat(array.pop() || "0");
					const c2y = parseFloat(array.pop() || "0");
					const x = parseFloat(array.pop() || "0");
					const y = parseFloat(array.pop() || "0");
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
			case "Q":
				absolute = true;
			case "q":
				{
					const cx = parseFloat(array.pop() || "0");
					const cy = parseFloat(array.pop() || "0");
					const x = parseFloat(array.pop() || "0");
					const y = parseFloat(array.pop() || "0");
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
			case "S":
				absolute = true;
			case "s":
				{
					const cx = parseFloat(array.pop() || "0");
					const cy = parseFloat(array.pop() || "0");
					const x = parseFloat(array.pop() || "0");
					const y = parseFloat(array.pop() || "0");

					// Smooth curve. First control point is the "reflection" of
					// the second control point in the previous path.
					let c1;
					const last =
						segments.length > 0 && segments[segments.length - 1];
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
			case "T":
				absolute = true;
			case "t":
				{
					const x = parseFloat(array.pop() || "0");
					const y = parseFloat(array.pop() || "0");
					let c;
					const last =
						segments.length > 0 && segments[segments.length - 1];
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
						case "m":
							array.push("l");
							break;
						case "M":
							array.push("L");
							break;
						default:
							if (last_command) {
								array.push(last_command);
							} else {
								array.push("L");
							}
					}
					continue;
				}

				throw new Error(
					`Invalid command ${command} from "${d}" : ${array.reverse()}`
				);
		}

		last_command = command;
	}

	return segments;
}
