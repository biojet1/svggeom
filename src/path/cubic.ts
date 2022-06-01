import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';

export class Cubic extends SegmentSE {
	readonly c1: Vec;
	readonly c2: Vec;
	t_value?: number;

	constructor(
		start: Iterable<number>,
		c1: Iterable<number>,
		c2: Iterable<number>,
		end: Iterable<number>,
	) {
		super(start, end);
		this.c1 = Vec.new(c1);
		this.c2 = Vec.new(c2);
	}

	new(start: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>) {
		return new Cubic(start, c1, c2, end);
	}

	bbox() {
		const { start, c1, c2, end } = this;
		const [xmin, xmax] = cubic_extrema(start.x, c1.x, c2.x, end.x);
		const [ymin, ymax] = cubic_extrema(start.y, c1.y, c2.y, end.y);
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	flatness() {
		let ux = Math.pow(3 * this.c1.x - 2 * this.start.x - this.end.x, 2);
		let uy = Math.pow(3 * this.c1.y - 2 * this.start.y - this.end.y, 2);
		const vx = Math.pow(3 * this.c2.x - 2 * this.end.x - this.start.x, 2);
		const vy = Math.pow(3 * this.c2.y - 2 * this.end.y - this.start.y, 2);
		if (ux < vx) {
			ux = vx;
		}
		if (uy < vy) {
			uy = vy;
		}
		return ux + uy;
	}
	get length() {
		return this.lengthAt();
	}
	lengthAt(t = 1) {
		const curves = this.splitAt(t)[0].makeFlat(t);
		let length = 0;
		for (let i = 0, len = curves.length; i < len; ++i) {
			length += curves[i].end.sub(curves[i].start).abs();
		}
		return length;
	}
	makeFlat(t: number): Cubic[] {
		if (this.flatness() > 0.15) {
			return this.splitAt(0.5)
				.map(function (el) {
					return el.makeFlat(t * 0.5);
				})
				.reduce(function (last, current) {
					return last.concat(current);
				}, []);
		} else {
			this.t_value = t;
			return [this];
		}
	}
	pointAt(t: number) {
		const { start, c1, c2, end } = this;
		const F = 1 - t;
		return Vec.at(
			F * F * F * start.x + 3 * F * F * t * c1.x + 3 * F * t * t * c2.x + t * t * t * end.x,
			F * F * F * start.y + 3 * F * F * t * c1.y + 3 * F * t * t * c2.y + t * t * t * end.y,
		);
	}

	splitAt(z: number) {
		const { start, c1, c2, end } = this;
		const x = this.splitAtScalar(z, start.x, c1.x, c2.x, end.x);
		const y = this.splitAtScalar(z, start.y, c1.y, c2.y, end.y);
		const a = this.new(
			Vec.at(x[0][0], y[0][0]),
			Vec.at(x[0][1], y[0][1]),
			Vec.at(x[0][2], y[0][2]),
			Vec.at(x[0][3], y[0][3]),
		);
		const b = this.new(
			Vec.at(x[1][0], y[1][0]),
			Vec.at(x[1][1], y[1][1]),
			Vec.at(x[1][2], y[1][2]),
			Vec.at(x[1][3], y[1][3]),
		);
		return [a, b];
	}

	splitAtScalar(
		z: number,
		start: number,
		end: number,
		p3: number,
		p4: number,
	): [[number, number, number, number], [number, number, number, number]] {
		const t =
			z * z * z * p4 -
			3 * z * z * (z - 1) * p3 +
			3 * z * (z - 1) * (z - 1) * end -
			(z - 1) * (z - 1) * (z - 1) * start;
		return [
			[
				start,
				z * end - (z - 1) * start,
				z * z * p3 - 2 * z * (z - 1) * end + (z - 1) * (z - 1) * start,
				t,
			],
			[t, z * z * p4 - 2 * z * (z - 1) * p3 + (z - 1) * (z - 1) * end, z * p4 - (z - 1) * p3, p4],
		];
	}
	toPathFragment() {
		const {
			c1: { x: x1, y: y1 },
			c2: { x: x2, y: y2 },
			end: { x: x3, y: y3 },
		} = this;
		return ['C', x1, y1, x2, y2, x3, y3];
	}

	slopeAt(t: number): Vec {
		const { start, c1, c2, end } = this;
		// let d1; // 1st derivative
		if (t <= 0) {
			return c1.sub(start);
		} else if (t >= 1) {
			return end.sub(c2);
		}
		if (start.equals(c1)) {
			if (end.equals(c2)) {
				return end.sub(start);
			}
			if (t <= 0) {
				return c2.sub(start).mul(2);
			} else {
				const a = c2.sub(start).mul(2 * (1 - t));
				const b = end.sub(c2).mul(t);
				return a.add(b);
			}
		} else if (end.equals(c2)) {
			const a = c1.sub(start).mul(2 * (1 - t));
			const b = end.sub(c1).mul(t);
			return a.add(b);
		} else {
			const a = c1.sub(start).mul(3 * (1 - t) ** 2);
			const b = c2.sub(c1).mul(6 * (1 - t) * t);
			const c = end.sub(c2).mul(3 * t ** 2);
			return a.add(b).add(c);
		}
	}
	transform(M: any) {
		const { start, c1, c2, end } = this;
		return this.new(start.transform(M), c1.transform(M), c2.transform(M), end.transform(M));
	}
	reversed() {
		const { start, c1, c2, end } = this;
		return this.new(end, c2, c1, start);
	}
}

function cubic_extrema(s: number, a: number, b: number, e: number) {
	//  Returns the extreme value, given a set of bezier coordinates
	let [atol, cmin, cmax] = [1e-9, Math.min(s, e), Math.max(s, e)];
	const pd1 = a - s;
	const pd2 = b - a;
	const pd3 = e - b;

	function _is_bigger(point: number) {
		if (point > 0 && point < 1) {
			const pyx =
				s * (1 - point) * (1 - point) * (1 - point) +
				3 * a * point * (1 - point) * (1 - point) +
				3 * b * point * point * (1 - point) +
				e * point * point * point;
			return [Math.min(cmin, pyx), Math.max(cmax, pyx)];
		}
		return [cmin, cmax];
	}

	if (Math.abs(pd1 - 2 * pd2 + pd3) > atol) {
		if (pd2 * pd2 > pd1 * pd3) {
			const pds = Math.sqrt(pd2 * pd2 - pd1 * pd3);
			[cmin, cmax] = _is_bigger((pd1 - pd2 + pds) / (pd1 - 2 * pd2 + pd3));
			[cmin, cmax] = _is_bigger((pd1 - pd2 - pds) / (pd1 - 2 * pd2 + pd3));
		}
	} else if (Math.abs(pd2 - pd1) > atol) {
		[cmin, cmax] = _is_bigger(-pd1 / (2 * (pd2 - pd1)));
	}
	return [cmin, cmax];
}

export { Cubic as CubicSegment };

// export class Cubic2 extends Segment {
// 	private readonly _start: Vec;
// 	private readonly _end: Vec;
// 	private readonly _c1: Vec;
// 	private readonly _c2: Vec;
// 	t_value?: number;
// 	constructor(start: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>) {
// 		this._start = Vec.new(start);
// 		this._end = Vec.new(end);
// 		this._c1 = Vec.new(c1);
// 		this._c2 = Vec.new(c2);
// 	}

// 	get start() {
// 		return this._start;
// 	}

// 	get end() {
// 		return this._end;
// 	}
// 	get c1() {
// 		return this._c1;
// 	}

// 	get c2() {
// 		return this._c2;
// 	}

// 	new(start: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>) {
// 		return new Cubic2(start, c1, c2, end);
// 	}
// }
