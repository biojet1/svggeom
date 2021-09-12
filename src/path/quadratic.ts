import {Point} from '../point.js';
import {Box} from '../box.js';
import {Segment} from './index.js';
import {Matrix} from '../matrix.js';
import {Cubic} from './cubic.js';

export class Quadratic extends Cubic {
	readonly c: Point;

	constructor(
		start: Point | number[],
		control: Point | number[],
		end: Point | number[]
	) {
		const p1 = Point.from(start);
		const c = Point.from(control);
		const p2 = Point.from(end);

		const c1 = p1.equals(c) ? p1 : p1.mul(1 / 3).add(c.mul(2 / 3));
		const c2 = p2.equals(c) ? p2 : c.mul(2 / 3).add(p2.mul(1 / 3));
		super(p1, c1, c2, p2);
		this.c = c;
	}
	slopeAt(t: number): Point {
		const {p1, c, p2} = this;

		if (t >= 1) {
			return p2.sub(c);
		} else if (t <= 0) {
			return c.sub(p1);
		}

		if (c.equals(p1) || c.equals(p2)) {
			const vec = p2.sub(p1);
			return vec.div(vec.abs());
		}
		const a = c.sub(p1).mul(1 - t);
		const b = p2.sub(c).mul(t);
		return a.add(b).mul(2); // 1st derivative;
	}
	pointAt(t: number) {
		const {p1, c, p2} = this;
		const v = 1 - t;
		return Point.at(
			v * v * p1.x + 2 * v * t * c.x + t * t * p2.x,
			v * v * p1.y + 2 * v * t * c.y + t * t * p2.y
		);
		//  return (1 - t)**2*self.start + 2*(1 - t)*t*self.control + t**2*self.end
	}

	splitAt(t: number) {
		const {
			p1: {x: x1, y: y1},
			c: {x: cx, y: cy},
			p2: {x: x2, y: y2},
		} = this;
		const mx1 = (1 - t) * x1 + t * cx;
		const mx2 = (1 - t) * cx + t * x2;
		const mxt = (1 - t) * mx1 + t * mx2;

		const my1 = (1 - t) * y1 + t * cy;
		const my2 = (1 - t) * cy + t * y2;
		const myt = (1 - t) * my1 + t * my2;

		return [
			new Quadratic(Point.at(x1, y1), Point.at(mx1, my1), Point.at(mxt, myt)),
			new Quadratic(Point.at(mxt, myt), Point.at(mx2, my2), Point.at(x2, y2)),
		];
	}

	bbox() {
		const {p1, c, p2} = this;
		const [x1, x2, x3] = [p1.x, c.x, p2.x];
		const [y1, y2, y3] = [p1.y, c.y, p2.y];
		const [xmin, xmax] = quadratic_extrema(x1, x2, x3);
		const [ymin, ymax] = quadratic_extrema(y1, y2, y3);
		return new Box([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	toPathFragment() {
		const {c, p2} = this;
		return ['Q', c.x, c.y, p2.x, p2.y];
	}
	// length() {
	// 	const {p1, c, p2} = this;
	// 	//     """Calculate the length of the path up to a certain position"""
	// 	//     a = self.start - 2 * self.control + self.end
	// 	const a = p1.sub(c.mul(2).add(p2));
	// 	//     b = 2 * (self.control - self.start)
	// 	const b = c.sub(p1).mul(2);
	// 	//     try:
	// 	//         # For an explanation of this case, see
	// 	//         # http://www.malczak.info/blog/quadratic-bezier-curve-length/
	// 	//         A = 4 * (a.real ** 2 + a.imag ** 2)
	// 	const A = 4 * (a.x * a.x + a.y * a.y);
	// 	//         B = 4 * (a.real * b.real + a.imag * b.imag)
	// 	const B = 4 * (a.x * b.x + a.y * b.y);
	// 	//         C = b.real ** 2 + b.imag ** 2
	// 	const C = b.x * b.x + b.y * b.y;
	// 	//         Sabc = 2 * sqrt(A + B + C)
	// 	const Sabc = 2 * Math.sqrt(A + B + C);
	// 	//         A2 = sqrt(A)
	// 	const A2 = Math.sqrt(A);
	// 	//         A32 = 2 * A * A2
	// 	const A32 = 2 * A * A2;
	// 	//         C2 = 2 * sqrt(C)
	// 	const C2 = 2 * Math.sqrt(C);
	// 	//         BA = B / A2
	// 	const BA = B / A2;
	// 	//         s = (
	// 	//             A32 * Sabc
	// 	//             + A2 * B * (Sabc - C2)
	// 	//             + (4 * C * A - B ** 2) * log((2 * A2 + BA + Sabc) / (BA + C2))
	// 	//         ) / (4 * A32)
	// 	const s =
	// 		(A32 * Sabc +
	// 			A2 * B * (Sabc - C2) +
	// 			(4 * C * A - B * B) * Math.log((2 * A2 + BA + Sabc) / (BA + C2))) /
	// 		(4 * A32);
	// 	assert.ok(
	// 		Number.isFinite(s),
	// 		`${A} ${B} ${C}`
	// 	);		//     except (ZeroDivisionError, ValueError):
	// 	//         # a_dot_b = a.real * b.real + a.imag * b.imag
	// 	//         if abs(a) < 1e-10:
	// 	//             s = abs(b)
	// 	//         else:
	// 	//             k = abs(b) / abs(a)
	// 	//             if k >= 2:
	// 	//                 s = abs(b) - abs(a)
	// 	//             else:
	// 	//                 s = abs(a) * (k ** 2 / 2 - k + 1)
	// 	//     return s
	// 	return s;
	// }
	transform(M: any) {
		const {p1, c, p2} = this;
		return new Quadratic(p1.transform(M), c.transform(M), p2.transform(M));
	}

	reversed() {
		const {p1, c, p2} = this;
		return new Quadratic(p2, c, p1);
	}
}

// def quadratic_extrema(a, b, c):
//     # type: (float, float, float) -> Tuple[float, float]
//     atol = 1e-9
//     cmin, cmax = min(a, c), max(a, c)

//     def _is_bigger(p):
//         if (p > 0) and (p < 1):
//             pyx = a * (1 - p) * (1 - p) + \
//                   2 * b * p * (1 - p) + \
//                   c * p * p
//             return min(cmin, pyx), max(cmax, pyx)
//         return cmin, cmax

//     if fabs(a + c - 2 * b) > atol:
//         cmin, cmax = _is_bigger((a - b) / (a + c - 2 * b))

//     return cmin, cmax
function quadratic_extrema(a:number, b:number, c:number) {
	const atol = 1e-9;
	const cmin = Math.min(a, c);
	const cmax = Math.max(a, c);

	if (Math.abs(a + c - 2 * b) > atol) {
		const p = (a - b) / (a + c - 2 * b);
		if (p > 0 && p < 1) {
			const e = a * (1 - p) * (1 - p) + 2 * b * p * (1 - p) + c * p * p;
			return [Math.min(cmin, e), Math.max(cmax, e)];
		}
	}
	return [cmin, cmax];
}

// function split_bezier(bpoints, t) {}

// def split_bezier(bpoints, t):
//     """Uses deCasteljau's recursion to split the Bezier curve at t into two
//     Bezier curves of the same order."""
//     def split_bezier_recursion(bpoints_left_, bpoints_right_, bpoints_, t_):
//         if len(bpoints_) == 1:
//             bpoints_left_.append(bpoints_[0])
//             bpoints_right_.append(bpoints_[0])
//         else:
//             new_points = [None]*(len(bpoints_) - 1)
//             bpoints_left_.append(bpoints_[0])
//             bpoints_right_.append(bpoints_[-1])
//             for i in range(len(bpoints_) - 1):
//                 new_points[i] = (1 - t_)*bpoints_[i] + t_*bpoints_[i + 1]
//             bpoints_left_, bpoints_right_ = split_bezier_recursion(
//                 bpoints_left_, bpoints_right_, new_points, t_)
//         return bpoints_left_, bpoints_right_

//     bpoints_left = []
//     bpoints_right = []
//     bpoints_left, bpoints_right = \
//         split_bezier_recursion(bpoints_left, bpoints_right, bpoints, t)
//     bpoints_right.reverse()
//     return bpoints_left, bpoints_right
