import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';

export class Quadratic extends SegmentSE {
	readonly c: Vec;

	constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>) {
		super(Vec.new(p1), Vec.new(p2));
		this.c = Vec.new(control);
	}
	private get _qpts(): Vec[] {
		const { from, c, to } = this;
		return [from, c, to];
	}
	override get length() {
		return quadLength(this._qpts);
	}
	override slopeAt(t: number): Vec {
		return quadSlopeAt(this._qpts, t);
	}

	override pointAt(t: number) {
		return quadPointAt(this._qpts, t);
	}

	override splitAt(t: number): [SegmentSE, SegmentSE] {
		const [a, b] = quadSplitAt(this._qpts, t);
		return [new Quadratic(a[0], a[1], a[2]), new Quadratic(b[0], b[1], b[2])];
	}

	override bbox() {
		return quadBBox(this._qpts);
	}

	override toPathFragment() {
		const { c, to } = this;
		return ['Q', c.x, c.y, to.x, to.y];
	}

	override transform(M: any) {
		const { from, c, to } = this;
		return new Quadratic(from.transform(M), c.transform(M), to.transform(M));
	}

	override reversed() {
		const { from, c, to } = this;
		return new Quadratic(to, c, from);
	}
}

// https://gitlab.com/inkscape/extensions/-/blob/master/inkex/transforms.py
function quadratic_extrema(a: number, b: number, c: number) {
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
const { pow } = Math;

// export function quadFlatness([[sx, sy], [cx, cy], [ex, ey]]: Iterable<number>[]) {
// 	// let ux = pow(3 * x1 - 2 * sx - ex, 2);   // 2cx−ex−sx
// 	// let uy = pow(3 * y1 - 2 * sy - ey, 2);   // 2cy−ey−sy
// 	// const vx = pow(3 * x2 - 2 * ex - sx, 2); // 2cx−ex−sx
// 	// const vy = pow(3 * y2 - 2 * ey - sy, 2); // 2cy−ey−sy
// 	// if (ux < vx) {
// 	// 	ux = vx;
// 	// }
// 	// if (uy < vy) {
// 	// 	uy = vy;
// 	// }
// 	// return ux + uy;
// 	return pow(2 * cx - ex - sx, 2) + pow(2 * cy - ey - sy, 2);
// }

export function quadSplitAt([[x1, y1], [cx, cy], [x2, y2]]: Vec[], t: number) {
	const mx1 = (1 - t) * x1 + t * cx;
	const mx2 = (1 - t) * cx + t * x2;
	const mxt = (1 - t) * mx1 + t * mx2;

	const my1 = (1 - t) * y1 + t * cy;
	const my2 = (1 - t) * cy + t * y2;
	const myt = (1 - t) * my1 + t * my2;

	return [
		[Vec.new(x1, y1), Vec.new(mx1, my1), Vec.new(mxt, myt)],
		[Vec.new(mxt, myt), Vec.new(mx2, my2), Vec.new(x2, y2)],
	];
}

export function quadPointAt([[x1, y1], [cx, cy], [x2, y2]]: Vec[], t: number) {
	const v = 1 - t;
	return Vec.new(v * v * x1 + 2 * v * t * cx + t * t * x2, v * v * y1 + 2 * v * t * cy + t * t * y2);
}

export function quadSlopeAt([from, c, to]: Vec[], t: number): Vec {
	if (c.equals(from) || c.equals(to)) {
		const vec = to.sub(from);
		return vec.div(vec.abs());
	}
	if (t >= 1) {
		return to.sub(c);
	} else if (t <= 0) {
		return c.sub(from);
	}

	const a = c.sub(from).mul(1 - t);
	const b = to.sub(c).mul(t);
	return a.add(b).mul(2); // 1st derivative;
}

export function quadBBox([[x1, y1], [x2, y2], [x3, y3]]: Vec[]) {
	const [xmin, xmax] = quadratic_extrema(x1, x2, x3);
	const [ymin, ymax] = quadratic_extrema(y1, y2, y3);
	return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
}

// https://github.com/rveciana/svg-path-properties/blob/master/src/bezier-functions.ts
export function quadLength([[x0, y0], [x1, y1], [x2, y2]]: Vec[], t: number = 1) {
	const ax = x0 - 2 * x1 + x2;
	const ay = y0 - 2 * y1 + y2;
	const bx = 2 * x1 - 2 * x0;
	const by = 2 * y1 - 2 * y0;

	const A = 4 * (ax * ax + ay * ay);
	const B = 4 * (ax * bx + ay * by);
	const C = bx * bx + by * by;

	if (A === 0) {
		return t * Math.sqrt(Math.pow(x2 - x0, 2) + Math.pow(y2 - y0, 2));
	}
	const b = B / (2 * A);
	const c = C / A;
	const u = t + b;
	const k = c - b * b;

	const uuk = u * u + k > 0 ? Math.sqrt(u * u + k) : 0;
	const bbk = b * b + k > 0 ? Math.sqrt(b * b + k) : 0;
	const term = b + Math.sqrt(b * b + k) !== 0 ? k * Math.log(Math.abs((u + uuk) / (b + bbk))) : 0;

	return (Math.sqrt(A) / 2) * (u * uuk - b * bbk + term);
}

// import { SegmentLS, MoveLS, LineLS } from './linked.js';
