import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Cubic } from './cubic.js';

export class Quadratic extends Cubic {
	readonly c: Vec;

	constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>) {
		const start = Vec.new(p1);
		const c = Vec.new(control);
		const end = Vec.new(p2);

		const c1 = start.equals(c) ? start : start.mul(1 / 3).add(c.mul(2 / 3));
		const c2 = end.equals(c) ? end : c.mul(2 / 3).add(end.mul(1 / 3));
		super(start, c1, c2, end);
		this.c = c;
	}
	private get _qpts(): Vec[] {
		const { start, c, end } = this;
		return [start, c, end];
	}

	override slopeAt(t: number): Vec {
		return slopeAt(this._qpts, t);
	}

	override pointAt(t: number) {
		return pointAt(this._qpts, t);
	}

	override splitAt(t: number) {
		const [a, b] = splitAt(this._qpts, t);
		return [new Quadratic(a[0], a[1], a[2]), new Quadratic(b[0], b[1], b[2])];
	}

	override bbox() {
		return bbox(this._qpts);
	}

	override toPathFragment() {
		const { c, end } = this;
		return ['Q', c.x, c.y, end.x, end.y];
	}

	override transform(M: any) {
		const { start, c, end } = this;
		return new Quadratic(start.transform(M), c.transform(M), end.transform(M));
	}

	override reversed() {
		const { start, c, end } = this;
		return new Quadratic(end, c, start);
	}
}

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

function splitAt([[x1, y1], [cx, cy], [x2, y2]]: Vec[], t: number) {
	const mx1 = (1 - t) * x1 + t * cx;
	const mx2 = (1 - t) * cx + t * x2;
	const mxt = (1 - t) * mx1 + t * mx2;

	const my1 = (1 - t) * y1 + t * cy;
	const my2 = (1 - t) * cy + t * y2;
	const myt = (1 - t) * my1 + t * my2;

	return [
		[Vec.pos(x1, y1), Vec.pos(mx1, my1), Vec.pos(mxt, myt)],
		[Vec.pos(mxt, myt), Vec.pos(mx2, my2), Vec.pos(x2, y2)],
	];
}

function pointAt([[x1, y1], [cx, cy], [x2, y2]]: Vec[], t: number) {
	const v = 1 - t;
	return Vec.pos(
		v * v * x1 + 2 * v * t * cx + t * t * x2,
		v * v * y1 + 2 * v * t * cy + t * t * y2,
	);
}

function slopeAt([start, c, end]: Vec[], t: number): Vec {
	if (t >= 1) {
		return end.sub(c);
	} else if (t <= 0) {
		return c.sub(start);
	}

	if (c.equals(start) || c.equals(end)) {
		const vec = end.sub(start);
		return vec.div(vec.abs());
	}
	const a = c.sub(start).mul(1 - t);
	const b = end.sub(c).mul(t);
	return a.add(b).mul(2); // 1st derivative;
}

function bbox([[x1, y1], [x2, y2], [x3, y3]]: Vec[]) {
	const [xmin, xmax] = quadratic_extrema(x1, x2, x3);
	const [ymin, ymax] = quadratic_extrema(y1, y2, y3);
	return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
}
