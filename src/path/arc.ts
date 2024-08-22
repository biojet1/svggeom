import { Vector } from '../vector.js';
import { BoundingBox } from '../bbox.js';
import { SegmentSE } from './index.js';
import { Line } from './line.js';
import { Cubic } from './cubic.js';
import { Matrix } from '../matrix.js';
import { segment_length, arc_params, arc_to_curve } from './archelp.js';
const { abs, atan, tan, cos, sin, PI, min, max } = Math;

interface IArc {
	readonly from: Vector;
	readonly to: Vector;
	//
	readonly rx: number;
	readonly ry: number;
	readonly phi: number;
	readonly bigArc: boolean;
	readonly sweep: boolean;
	//
	readonly cosφ: number;
	readonly sinφ: number;
	readonly rtheta: number;
	readonly rdelta: number;
	readonly cx: number;
	readonly cy: number;
	//
	pointAt(f: number): Vector;
}

export class Arc extends SegmentSE {
	readonly rx: number;
	readonly ry: number;
	readonly phi: number;
	readonly bigArc: boolean;
	readonly sweep: boolean;
	//
	readonly cosφ: number;
	readonly sinφ: number;
	readonly rtheta: number;
	readonly rdelta: number;
	readonly cx: number;
	readonly cy: number;
	private constructor(
		from: Iterable<number>,
		to: Iterable<number>,
		rx: number,
		ry: number,
		φ: number,
		bigArc: boolean | number,
		sweep: boolean | number
	) {
		if (!(isFinite(φ) && isFinite(rx) && isFinite(ry)))
			throw Error(`${JSON.stringify(arguments)}`);
		super(from, to);

		const [x1, y1] = this.from;
		const [x2, y2] = this.to;

		[
			this.phi,
			this.rx,
			this.ry,
			this.sinφ,
			this.cosφ,
			this.cx,
			this.cy,
			this.rtheta,
			this.rdelta,
		] = arc_params(x1, y1, rx, ry, φ, (this.bigArc = !!bigArc), (this.sweep = !!sweep), x2, y2);
	}
	static fromEndPoint(
		from: Iterable<number>,
		rx: number,
		ry: number,
		φ: number,
		bigArc: boolean | number,
		sweep: boolean | number,
		to: Iterable<number>
	) {
		if (!rx || !ry) {
			return new Line(from, to);
		}
		return new Arc(from, to, rx, ry, φ, bigArc, sweep);
	}
	static fromCenterForm(c: Vector, rx: number, ry: number, φ: number, θ: number, Δθ: number) {
		const cosφ = cos((φ / 180) * PI);
		const sinφ = sin((φ / 180) * PI);
		const m = Matrix.matrix(cosφ, sinφ, -sinφ, cosφ, 0, 0);
		const from = Vector.new(rx * cos((θ / 180) * PI), ry * sin((θ / 180) * PI))
			.transform(m)
			.add(c);
		const to = Vector.new(rx * cos(((θ + Δθ) / 180) * PI), ry * sin(((θ + Δθ) / 180) * PI))
			.transform(m)
			.add(c);
		const bigArc = abs(Δθ) > 180 ? 1 : 0;
		const sweep = Δθ > 0 ? 1 : 0;
		return new Arc(from, to, rx, ry, φ, bigArc, sweep);
	}
	// clone() {
	// 	return new Arc(this.from, this.to, this.rx, this.ry, this.phi, this.bigArc, this.sweep);
	// }
	override bbox() {
		return arcBBox(this);
	}
	override get length() {
		return arcLength(this);
	}
	override pointAt(t: number) {
		return arcPointAt(this, t);
	}
	override slopeAt(t: number): Vector {
		return arcSlopeAt(this, t);
	}

	override splitAt(t: number): [SegmentSE, SegmentSE] {
		const { rx, ry, phi, sweep, rdelta, from, to } = this;
		const deltaA = abs(rdelta);
		const mid = arcPointAt(this, t);
		return [
			new Arc(from, mid, rx, ry, phi, deltaA * t > PI, sweep),
			new Arc(mid, to, rx, ry, phi, deltaA * (1 - t) > PI, sweep),
		];
	}

	override toPathFragment() {
		const {
			rx,
			ry,
			phi,
			sweep,
			bigArc,
			to: [x, y],
		} = this;
		return ['A', rx, ry, phi, bigArc ? 1 : 0, sweep ? 1 : 0, x, y];
	}

	override transform(matrix: any) {
		const { bigArc, to, from } = this;
		const [rx, ry, phi, sweep] = arcTransform(this, matrix);
		return new Arc(from.transform(matrix), to.transform(matrix), rx, ry, phi, bigArc, sweep);
	}

	override reversed() {
		const { bigArc, to, from, rx, ry, sweep, phi } = this;
		return new Arc(to, from, rx, ry, phi, bigArc, sweep ? 0 : 1);
	}

	asCubic() {
		const { rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta } = this;
		const segments = arc_to_curve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
		// Degenerated arcs can be ignored by renderer, but should not be dropped
		// to avoid collisions with `S A S` and so on. Replace with empty line.
		if (segments.length === 0) {
			const { to, from } = this;
			return [new Line(from, to)];
		} else {
			return segments.map(function (s) {
				return new Cubic([s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]);
			});
		}
	}
}

export function arcPointAt(arc: IArc, t: number) {
	const { from, to } = arc;
	if (from.equals(to)) {
		return from.clone();
	} else if (t <= 0) {
		return from;
	} else if (t >= 1) {
		return to;
	}
	const { rx, ry, cosφ, sinφ, rtheta, rdelta, cx, cy } = arc;
	const θ = rtheta + rdelta * t;
	const sinθ = sin(θ);
	const cosθ = cos(θ);
	// const [cosθ, sinθ] = cossin((180 * rtheta + 180 * rdelta * t) / PI);
	// (eq. 3.1) https://svgwg.org/svg2-draft/implnote.html#ArcParameterizationAlternatives
	try {
		return Vector.new(
			rx * cosφ * cosθ - ry * sinφ * sinθ + cx,
			rx * sinφ * cosθ + ry * cosφ * sinθ + cy
		);
	} catch (err) {
		console.warn(rtheta, rdelta, rx, cosφ, cosθ, ry, sinφ, sinθ, cx, cy);
		throw err;
	}
}

export function arcBBox(arc: IArc) {
	const { rx, ry, cosφ, sinφ, from, to, rdelta, rtheta, phi } = arc;
	let atan_x, atan_y;
	if (cosφ == 0) {
		atan_x = PI / 2;
		atan_y = 0;
	} else if (sinφ == 0) {
		atan_x = 0;
		atan_y = PI / 2;
	} else {
		const tanφ = tan(phi);
		atan_x = atan(-(ry / rx) * tanφ);
		atan_y = atan(ry / rx / tanφ);
	}
	const xtrema = [from.x, to.x];
	const ytrema = [from.y, to.y];
	function angle_inv(ang: number, k: number) {
		return (ang + PI * k - rtheta) / rdelta;
	}
	for (let k = -4; k < 5; ++k) {
		const tx = angle_inv(atan_x, k);
		const ty = angle_inv(atan_y, k);
		0 <= tx && tx <= 1 && xtrema.push(arcPointAt(arc, tx).x);
		0 <= ty && ty <= 1 && ytrema.push(arcPointAt(arc, ty).y);
	}
	const [xmin, xmax] = [min(...xtrema), max(...xtrema)];
	const [ymin, ymax] = [min(...ytrema), max(...ytrema)];
	return BoundingBox.new([xmin, ymin, xmax - xmin, ymax - ymin]);
}

export function arcLength(arc: IArc) {
	const { from, to } = arc;
	if (from.equals(to)) return 0;
	return segment_length(arc, 0, 1, from, to);
}

// function arcSplitAt(arc: IArc, t: number) {
// 	const { rx, ry, phi, sweep, rdelta, from, to } = arc;
// 	const deltaA = abs(rdelta);
// 	const delta1 = deltaA * t;
// 	const delta2 = deltaA * (1 - t);
// 	const pT = arcPointAt(arc, t);
// 	return [
// 		[from, pT, delta1 > PI],
// 		[pT, to, delta2 > PI],
// 	];
// }

export function arcSlopeAt(arc: IArc, t: number): Vector {
	const { rx, ry, cosφ, sinφ, rdelta, rtheta } = arc;
	const θ = rtheta + t * rdelta;
	const sinθ = sin(θ);
	const cosθ = cos(θ);
	const k = rdelta;
	return Vector.new(
		-rx * cosφ * sinθ * k - ry * sinφ * cosθ * k,
		-rx * sinφ * sinθ * k + ry * cosφ * cosθ * k
	);
}

export function arcTransform(self: IArc, matrix: any) {
	// const { arc, to, from } = self;
	let { rx, ry, sweep, phi } = self;
	// const p1ˈ = from.transform(matrix);
	// const p2_ = to.transform(matrix);
	const { rotate, scaleX, scaleY, skewX } = matrix.decompose();
	if (scaleX == scaleY && scaleX != 1) {
		rx = rx * scaleX;
		ry = ry * scaleX;
	}

	OUT: if (rotate || skewX || scaleX != 1 || scaleY != 1) {
		phi = (((phi + rotate) % 360) + 360) % 360; // from -30 -> 330
		const { a, c, b, d } = matrix;
		const detT = a * d - b * c;
		const detT2 = detT * detT;
		if (!rx || !ry || !detT2) break OUT;
		// const A = (d ** 2 / rx ** 2 + c ** 2 / ry ** 2) / detT2;
		// const B = -((d * b) / rx ** 2 + (c * a) / ry ** 2) / detT2;
		// const D = (b ** 2 / rx ** 2 + a ** 2 / ry ** 2) / detT2;
		// const DA = D - A;
		if (detT < 0) {
			sweep = !sweep;
		}
	}

	return [rx, ry, phi, sweep ? 1 : 0];
}

// function arcToCubic(self: IArc) {
// 	const { rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta } = self;
// 	return arcToCurve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
// }
