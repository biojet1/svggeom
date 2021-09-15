import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment } from "./index.js";
import { Matrix } from "../matrix.js";
// import assert from "assert";

export class Cubic extends Segment {
	readonly c1: Point;
	readonly c2: Point;
	// readonly p1: Point;
	// readonly p2: Point;
	t_value?: number;
	constructor(
		p1: Point | number[],
		c1: Point | number[],
		c2: Point | number[],
		p2: Point | number[]
	) {
		super(Point.new(p1), Point.new(p2));

		// this.p1 = Point.new(p1);
		this.c1 = Point.new(c1);
		this.c2 = Point.new(c2);
		// this.p2 = Point.new(p2);
	}
	// static fromQuad(
	// 	start: Point | number[],
	// 	control: Point | number[],
	// 	end: Point | number[]
	// ) {
	// 	// const p1 = Point.new(start);
	// 	// const c = Point.new(control);
	// 	// const p2 = Point.new(end);

	// 	// const c1 = p1.equals(c) ? p1 : p1.mul(1 / 3).add(c.mul(2 / 3));
	// 	// const c2 = p2.equals(c) ? p2 : c.mul(2 / 3).add(p2.mul(1 / 3));
	// 	// return new Cubic(p1, c1, c2, p2);
	// 	return new Quadratic(start, control, end);
	// }

	// static fromArc(
	// 	p1: Point,
	// 	p2: Point,
	// 	rx: number,
	// 	ry: number,
	// 	φ: number,
	// 	arc: number,
	// 	sweep: number
	// ) {
	// 	const v = arcToCubic(p1.x, p1.y, rx, ry, φ, arc, sweep, p2.x, p2.y, 0);
	// }

	// findRootsXY(p1: number, p2: number, p3: number, p4: number) {
	// 	const a = 3 * (-p1 + 3 * p2 - 3 * p3 + p4);
	// 	const b = 6 * (p1 - 2 * p2 + p3);
	// 	const c = 3 * (p2 - p1);
	// 	if (a === 0)
	// 		return [-c / b].filter(function (el) {
	// 			return el > 0 && el < 1;
	// 		});
	// 	if (b * b - 4 * a * c < 0) return [];
	// 	if (b * b - 4 * a * c === 0)
	// 		return [Math.round((-b / (2 * a)) * 100000) / 100000].filter(function (
	// 			el
	// 		) {
	// 			return el > 0 && el < 1;
	// 		});
	// 	return [
	// 		Math.round(((-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)) * 100000) /
	// 			100000,
	// 		Math.round(((-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)) * 100000) /
	// 			100000,
	// 	].filter(function (el) {
	// 		return el > 0 && el < 1;
	// 	});
	// }
	// findRootsX() {
	// 	return this.findRootsXY(this.p1.x, this.c1.x, this.c2.x, this.p2.x);
	// }
	// findRootsY() {
	// 	return this.findRootsXY(this.p1.y, this.c1.y, this.c2.y, this.p2.y);
	// }
	// findRoots() {
	// 	return this.findRootsX().concat(this.findRootsY());
	// }
	// getCloud() {
	// 	const points = this.findRoots()
	// 		.filter(root => root !== 0 && root !== 1)
	// 		.map(root => this.pointAt(root))
	// 		.concat(this.p1, this.p2);
	// 	return new PointCloud(points);
	// }
	bbox() {
		// const {min, max} = curveDim(p1.x, p1.y, c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
		// return new Box([min.x, min.y, max.x - min.x, max.y - min.y]);
		// return this.getCloud().bbox();
		const { p1, c1, c2, p2 } = this;
		const [xmin, xmax] = cubic_extrema(p1.x, c1.x, c2.x, p2.x);
		const [ymin, ymax] = cubic_extrema(p1.y, c1.y, c2.y, p2.y);
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);

		// def update_bounding_box(self, first, last_two_points, bbox):
		//     from .transforms import cubic_extrema

		//     x1, x2, x3, x4 = last_two_points[-1].x, self.x2, self.x3, self.x4
		//     y1, y2, y3, y4 = last_two_points[-1].y, self.y2, self.y3, self.y4

		//     if not (x1 in bbox.x and
		//             x2 in bbox.x and
		//             x3 in bbox.x and
		//             x4 in bbox.x):
		//         bbox.x += cubic_extrema(x1, x2, x3, x4)

		//     if not (y1 in bbox.y and
		//             y2 in bbox.y and
		//             y3 in bbox.y and
		//             y4 in bbox.y):
		//         bbox.y += cubic_extrema(y1, y2, y3, y4)
	}

	flatness() {
		let ux = Math.pow(3 * this.c1.x - 2 * this.p1.x - this.p2.x, 2);
		let uy = Math.pow(3 * this.c1.y - 2 * this.p1.y - this.p2.y, 2);
		const vx = Math.pow(3 * this.c2.x - 2 * this.p2.x - this.p1.x, 2);
		const vy = Math.pow(3 * this.c2.y - 2 * this.p2.y - this.p1.y, 2);
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
			length += curves[i].p2.sub(curves[i].p1).abs();
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
		const { p1, c1, c2, p2 } = this;
		// if (p1.equals(c1)) {
		// 	return new Point(
		// 		(1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * c2.x + t * t * p2.x,
		// 		(1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * c2.y + t * t * p2.y
		// 	);
		// }
		const F = 1 - t;
		return Point.at(
			F * F * F * p1.x +
				3 * F * F * t * c1.x +
				3 * F * t * t * c2.x +
				t * t * t * p2.x,
			F * F * F * p1.y +
				3 * F * F * t * c1.y +
				3 * F * t * t * c2.y +
				t * t * t * p2.y
		);

		// return (1 - t)**2*self.start + 2*(1 - t)*t*self.control + t**2*self.end
	}
	splitAt(z: number) {
		const { p1, c1, c2, p2 } = this;
		const x = this.splitAtScalar(z, p1.x, c1.x, c2.x, p2.x);
		const y = this.splitAtScalar(z, p1.y, c1.y, c2.y, p2.y);
		// const x = this.splitAtScalar(z, "x");
		// const y = this.splitAtScalar(z, "y");
		const a = new Cubic(
			Point.at(x[0][0], y[0][0]),
			Point.at(x[0][1], y[0][1]),
			Point.at(x[0][2], y[0][2]),
			Point.at(x[0][3], y[0][3])
		);
		const b = new Cubic(
			Point.at(x[1][0], y[1][0]),
			Point.at(x[1][1], y[1][1]),
			Point.at(x[1][2], y[1][2]),
			Point.at(x[1][3], y[1][3])
		);
		return [a, b];
	}
	splitAtScalar(
		z: number,
		p1: number,
		p2: number,
		p3: number,
		p4: number
	): [[number, number, number, number], [number, number, number, number]] {
		// const p1 = this.p1[p];
		// const p2 = this.c1[p];
		// const p3 = this.c2[p];
		// const p4 = this.p2[p];
		const t =
			z * z * z * p4 -
			3 * z * z * (z - 1) * p3 +
			3 * z * (z - 1) * (z - 1) * p2 -
			(z - 1) * (z - 1) * (z - 1) * p1;
		return [
			[
				p1,
				z * p2 - (z - 1) * p1,
				z * z * p3 - 2 * z * (z - 1) * p2 + (z - 1) * (z - 1) * p1,
				t,
			],
			[
				t,
				z * z * p4 - 2 * z * (z - 1) * p3 + (z - 1) * (z - 1) * p2,
				z * p4 - (z - 1) * p3,
				p4,
			],
		];
	}
	toPathFragment() {
		const {
			c1: { x: x1, y: y1 },
			c2: { x: x2, y: y2 },
			p2: { x: x3, y: y3 },
		} = this;
		return ["C", x1, y1, x2, y2, x3, y3];
	}

	slopeAt(t: number): Point {
		const { p1, c1, c2, p2 } = this;

		// return 3 * (p[1] - p[0]) * (1 - t) ** 2 + 6 * (p[2] - p[1]) * (1 - t) * t + 3 * (p[3] - p[2]) * t ** 2
		// 3 * (p[1] - p[0]) * (1 - t) ** 2
		//  + 6 * (p[2] - p[1]) * (1 - t) * t
		//   + 3 * (p[3] - p[2]) * t ** 2
		let d1; // 1st derivative
		if (t <= 0) {
			return c1.sub(p1);
		} else if (t >= 1) {
			return p2.sub(c2);
		}
		if (p1.equals(c1)) {
			if (p2.equals(c2)) {
				return p2.sub(p1);
			}
			if (t <= 0) {
				return c2.sub(p1).mul(2);
			} else {
				const a = c2.sub(p1).mul(2 * (1 - t));
				const b = p2.sub(c2).mul(t);
				return a.add(b);
			}
		} else if (p2.equals(c2)) {
			const a = c1.sub(p1).mul(2 * (1 - t));
			const b = p2.sub(c1).mul(t);
			return a.add(b);
		} else {
			const a = c1.sub(p1).mul(3 * (1 - t) ** 2);
			const b = c2.sub(c1).mul(6 * (1 - t) * t);
			const c = p2.sub(c2).mul(3 * t ** 2);
			return a.add(b).add(c);
		}
		// const d = d1.abs();
		// if (d === 0) {
		// 	console.dir({t: t, d1: d1, seg: this}, {depth: null});
		// 	// console.dir(t, {depth: null});
		// }
		// assert.ok(
		// 	Number.isFinite(d) && d != 0,
		// 	`d=${d} ${d1.x} ${d1.y} p1 ${p1.x} ${p1.y} c1 ${c1.x} ${c1.y} c2 ${c2.x} ${c2.y} p2 ${p2.x} ${p2.y}`
		// );

		// return d1.div(d);
	}
	transform(M: any) {
		const { p1, c1, c2, p2 } = this;
		return new Cubic(
			p1.transform(M),
			c1.transform(M),
			c2.transform(M),
			p2.transform(M)
		);
	}
	reversed() {
		const { p1, c1, c2, p2 } = this;
		return new Cubic(p2, c2, c1, p1);
	}
}

// function curveDim(
// 	x0: number,
// 	y0: number,
// 	x1: number,
// 	y1: number,
// 	x2: number,
// 	y2: number,
// 	x3: number,
// 	y3: number
// ) {
// 	const mmin = Math.min;
// 	const mmax = Math.max;
// 	// pow = math.pow,
// 	const abs = Math.abs;
// 	let tvalues = [],
// 		bounds = [[], []],
// 		a,
// 		b,
// 		c,
// 		t,
// 		t1,
// 		t2,
// 		b2ac,
// 		sqrtb2ac;
// 	for (var i = 0; i < 2; ++i) {
// 		if (i == 0) {
// 			b = 6 * x0 - 12 * x1 + 6 * x2;
// 			a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
// 			c = 3 * x1 - 3 * x0;
// 		} else {
// 			b = 6 * y0 - 12 * y1 + 6 * y2;
// 			a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
// 			c = 3 * y1 - 3 * y0;
// 		}
// 		if (abs(a) < 1e-12) {
// 			if (abs(b) < 1e-12) {
// 				continue;
// 			}
// 			t = -c / b;
// 			if (0 < t && t < 1) {
// 				tvalues.push(t);
// 			}
// 			continue;
// 		}
// 		b2ac = b * b - 4 * c * a;
// 		sqrtb2ac = Math.sqrt(b2ac);
// 		if (b2ac < 0) {
// 			continue;
// 		}
// 		t1 = (-b + sqrtb2ac) / (2 * a);
// 		if (0 < t1 && t1 < 1) {
// 			tvalues.push(t1);
// 		}
// 		t2 = (-b - sqrtb2ac) / (2 * a);
// 		if (0 < t2 && t2 < 1) {
// 			tvalues.push(t2);
// 		}
// 	}

// 	let x,
// 		y,
// 		j = tvalues.length,
// 		jlen = j,
// 		mt;
// 	while (j--) {
// 		t = tvalues[j];
// 		mt = 1 - t;
// 		bounds[0][j] =
// 			mt * mt * mt * x0 +
// 			3 * mt * mt * t * x1 +
// 			3 * mt * t * t * x2 +
// 			t * t * t * x3;
// 		bounds[1][j] =
// 			mt * mt * mt * y0 +
// 			3 * mt * mt * t * y1 +
// 			3 * mt * t * t * y2 +
// 			t * t * t * y3;
// 	}

// 	bounds[0][jlen] = x0;
// 	bounds[1][jlen] = y0;
// 	bounds[0][jlen + 1] = x3;
// 	bounds[1][jlen + 1] = y3;
// 	bounds[0].length = bounds[1].length = jlen + 2;

// 	return {
// 		min: { x: mmin.apply(0, bounds[0]), y: mmin.apply(0, bounds[1]) },
// 		max: { x: mmax.apply(0, bounds[0]), y: mmax.apply(0, bounds[1]) },
// 	};
// }

// function arcToCubic(
// 	x1: number,
// 	y1: number,
// 	rx: number,
// 	ry: number,
// 	angle: number,
// 	LAF: number,
// 	SF: number,
// 	x2: number,
// 	y2: number,
// 	recursive: boolean
// ) {
// 	const d120 = (Math.PI * 120) / 180;
// 	const rad = (Math.PI / 180) * (angle || 0);
// 	let res:string[] = [];
// 	let X1 = x1;
// 	let X2 = x2;
// 	let Y1 = y1;
// 	let Y2 = y2;
// 	let RX = rx;
// 	let RY = ry;
// 	let xy;
// 	let f1;
// 	let f2;
// 	let cx;
// 	let cy;

// 	if (!recursive) {
// 		xy = rotateVector(X1, Y1, -rad);
// 		X1 = xy.x;
// 		Y1 = xy.y;
// 		xy = rotateVector(X2, Y2, -rad);
// 		X2 = xy.x;
// 		Y2 = xy.y;

// 		const x = (X1 - X2) / 2;
// 		const y = (Y1 - Y2) / 2;
// 		let h = (x * x) / (RX * RY) + y ** 2 / RY ** 2;
// 		if (h > 1) {
// 			h = Math.sqrt(h);
// 			RX *= h;
// 			RY *= h;
// 		}
// 		const rx2 = RX ** 2;
// 		const ry2 = RY ** 2;
// 		const k =
// 			(LAF === SF ? -1 : 1) *
// 			Math.sqrt(
// 				Math.abs(
// 					(rx2 * ry2 - rx2 * y * y - ry2 * x * x) /
// 						(rx2 * y * y + ry2 * x * x)
// 				)
// 			);

// 		cx = (k * RX * y) / RY + (X1 + X2) / 2;
// 		cy = (k * -RY * x) / RX + (Y1 + Y2) / 2;

// 		// f1 = Math.asin(((Y1 - cy) / RY).toFixed(9)); // keep toFIxed(9)!
// 		// f2 = Math.asin(((Y2 - cy) / RY).toFixed(9));
// 		f1 = Math.asin(((((Y1 - cy) / RY) * 10 ** 9) >> 0) / 10 ** 9);
// 		f2 = Math.asin(((((Y2 - cy) / RY) * 10 ** 9) >> 0) / 10 ** 9);

// 		f1 = X1 < cx ? Math.PI - f1 : f1;
// 		f2 = X2 < cx ? Math.PI - f2 : f2;

// 		if (f1 < 0) f1 = Math.PI * 2 + f1;
// 		if (f2 < 0) f2 = Math.PI * 2 + f2;

// 		if (SF && f1 > f2) {
// 			f1 -= Math.PI * 2;
// 		}
// 		if (!SF && f2 > f1) {
// 			f2 -= Math.PI * 2;
// 		}
// 	} else {
// 		const [r1, r2, r3, r4] = recursive;
// 		f1 = r1;
// 		f2 = r2;
// 		cx = r3;
// 		cy = r4;
// 	}

// 	let df = f2 - f1;

// 	if (Math.abs(df) > d120) {
// 		const f2old = f2;
// 		const x2old = X2;
// 		const y2old = Y2;

// 		f2 = f1 + d120 * (SF && f2 > f1 ? 1 : -1);
// 		X2 = cx + RX * Math.cos(f2);
// 		Y2 = cy + RY * Math.sin(f2);
// 		res = arcToCubic(X2, Y2, RX, RY, angle, 0, SF, x2old, y2old, [
// 			f2,
// 			f2old,
// 			cx,
// 			cy,
// 		]);
// 	}

// 	df = f2 - f1;
// 	const c1 = Math.cos(f1);
// 	const s1 = Math.sin(f1);
// 	const c2 = Math.cos(f2);
// 	const s2 = Math.sin(f2);
// 	const t = Math.tan(df / 4);
// 	const hx = (4 / 3) * RX * t;
// 	const hy = (4 / 3) * RY * t;
// 	const m1 = [X1, Y1];
// 	const m2 = [X1 + hx * s1, Y1 - hy * c1];
// 	const m3 = [X2 + hx * s2, Y2 - hy * c2];
// 	const m4 = [X2, Y2];
// 	m2[0] = 2 * m1[0] - m2[0];
// 	m2[1] = 2 * m1[1] - m2[1];

// 	if (recursive) {
// 		return [m2, m3, m4].concat(res);
// 	}
// 	res = [m2, m3, m4].concat(res).join().split(",");
// 	return res.map((rz, i) => {
// 		if (i % 2) {
// 			return rotateVector(parseFloat(res[i - 1]), rz, rad).y;
// 		}
// 		return rotateVector(rz, parseFloat(res[i + 1]), rad).x;
// 	});
// }
// function rotateVector(x: number, y: number, rad: number) {
// 	const X = x * Math.cos(rad) - y * Math.sin(rad);
// 	const Y = x * Math.sin(rad) + y * Math.cos(rad);
// 	return { x: X, y: Y };
// }

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
			[cmin, cmax] = _is_bigger(
				(pd1 - pd2 + pds) / (pd1 - 2 * pd2 + pd3)
			);
			[cmin, cmax] = _is_bigger(
				(pd1 - pd2 - pds) / (pd1 - 2 * pd2 + pd3)
			);
		}
	} else if (Math.abs(pd2 - pd1) > atol) {
		[cmin, cmax] = _is_bigger(-pd1 / (2 * (pd2 - pd1)));
	}
	return [cmin, cmax];
}
