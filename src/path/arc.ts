import {Vec} from '../point.js';
import {Box} from '../box.js';
import {SegmentSE} from './index.js';
import {Line} from './line.js';
import {Cubic} from './cubic.js';
import {Matrix} from '../matrix.js';
import {cossin, unit_vector_angle, segment_length, arcParams, arcToCurve} from '../util.js';
const {abs, atan, tan, cos, sin, sqrt, acos, atan2, pow, PI, min, max, ceil} = Math;

export class Arc extends SegmentSE {
	readonly rx: number;
	readonly ry: number;
	readonly phi: number;
	readonly arc: boolean;
	readonly sweep: boolean;
	//
	readonly cosφ: number;
	readonly sinφ: number;
	readonly rtheta: number;
	readonly rdelta: number;
	readonly cx: number;
	readonly cy: number;
	private constructor(
		start: Iterable<number>,
		end: Iterable<number>,
		rx: number,
		ry: number,
		φ: number,
		arc: boolean | number,
		sweep: boolean | number
	) {
		if (!(isFinite(φ) && isFinite(rx) && isFinite(ry))) throw Error(`${JSON.stringify(arguments)}`);
		super(start, end);

		const {x: x1, y: y1} = this.start;
		const {x: x2, y: y2} = this.end;

		[this.phi, this.rx, this.ry, this.sinφ, this.cosφ, this.cx, this.cy, this.rtheta, this.rdelta] = arcParams(
			x1,
			y1,
			rx,
			ry,
			φ,
			(this.arc = !!arc),
			(this.sweep = !!sweep),
			x2,
			y2
		);
	}
	static fromEndPoint(
		start: Iterable<number>,
		rx: number,
		ry: number,
		φ: number,
		arc: boolean | number,
		sweep: boolean | number,
		end: Iterable<number>
	) {
		if (!rx || !ry) {
			return new Line(start, end);
		}
		return new Arc(start, end, rx, ry, φ, arc, sweep);
	}
	static fromCenterForm(c: Vec, rx: number, ry: number, φ: number, θ: number, Δθ: number) {
		const cosφ = cos((φ / 180) * PI);
		const sinφ = sin((φ / 180) * PI);
		const m = Matrix.hexad(cosφ, sinφ, -sinφ, cosφ, 0, 0);
		const start = Vec.at(rx * cos((θ / 180) * PI), ry * sin((θ / 180) * PI))
			.transform(m)
			.add(c);
		const end = Vec.at(rx * cos(((θ + Δθ) / 180) * PI), ry * sin(((θ + Δθ) / 180) * PI))
			.transform(m)
			.add(c);
		const arc = abs(Δθ) > 180 ? 1 : 0;
		const sweep = Δθ > 0 ? 1 : 0;
		return new Arc(start, end, rx, ry, φ, arc, sweep);
	}
	bbox() {
		const {rx, ry, cosφ, sinφ, start, end, rdelta, rtheta, phi} = this;
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
		const xtrema = [start.x, end.x];
		const ytrema = [start.y, end.y];
		function angle_inv(ang: number, k: number) {
			return (ang + PI * k - rtheta) / rdelta;
		}
		for (let k = -4; k < 5; ++k) {
			const tx = angle_inv(atan_x, k);
			const ty = angle_inv(atan_y, k);
			0 <= tx && tx <= 1 && xtrema.push(this.pointAt(tx).x);
			0 <= ty && ty <= 1 && ytrema.push(this.pointAt(ty).y);
		}
		const [xmin, xmax] = [min(...xtrema), max(...xtrema)];
		const [ymin, ymax] = [min(...ytrema), max(...ytrema)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}
	clone() {
		return new Arc(this.start, this.end, this.rx, this.ry, this.phi, this.arc, this.sweep);
	}
	get length() {
		const {start, end} = this;
		if (start.equals(end)) return 0;
		return segment_length(this, 0, 1, start, end);
	}
	pointAt(t: number) {
		const {start, end} = this;
		if (start.equals(end)) {
			return start.clone();
		} else if (t <= 0) {
			return start;
		} else if (t >= 1) {
			return end;
		}
		const {rx, ry, cosφ, sinφ, rtheta, rdelta, cx, cy} = this;
		const θ = rtheta + rdelta * t;
		const sinθ = sin(θ);
		const cosθ = cos(θ);
		// const [cosθ, sinθ] = cossin((180 * rtheta + 180 * rdelta * t) / PI);
		// (eq. 3.1) https://svgwg.org/svg2-draft/implnote.html#ArcParameterizationAlternatives
		try {
			return Vec.at(rx * cosφ * cosθ - ry * sinφ * sinθ + cx, rx * sinφ * cosθ + ry * cosφ * sinθ + cy);
		} catch (err) {
			console.log(rtheta, rdelta, rx, cosφ, cosθ, ry, sinφ, sinθ, cx, cy);
			throw err;
		}
	}
	splitAt(t: number) {
		const {rx, ry, phi, sweep, rdelta, start, end} = this;
		const deltaA = abs(rdelta);
		const delta1 = deltaA * t;
		const delta2 = deltaA * (1 - t);
		const pT = this.pointAt(t);
		return [new Arc(start, pT, rx, ry, phi, delta1 > PI, sweep), new Arc(pT, end, rx, ry, phi, delta2 > PI, sweep)];
	}

	toPathFragment() {
		return ['A', this.rx, this.ry, this.phi, this.arc ? 1 : 0, this.sweep ? 1 : 0, this.end.x, this.end.y];
	}
	// toString() {
	// 	return `start: ${this.start.x.toFixed(4)} ${this.start.y.toFixed(
	// 		4
	// 	)}, end: ${this.end.x.toFixed(4)} ${this.end.y.toFixed(
	// 		4
	// 	)}, cen: ${this.cen.x.toFixed(4)} ${this.cen.y.toFixed(
	// 		4
	// 	)} theta: ${this.theta.toFixed(4)}, theta2: ${this.theta2.toFixed(
	// 		4
	// 	)}, delta: ${this.delta.toFixed(4)}, large: ${this.arc}, sweep: ${
	// 		this.sweep
	// 	}`;
	// }
	slopeAt(t: number): Vec {
		// throw new Error('Not implemented');
		const {rx, ry, cosφ, sinφ, rdelta, rtheta} = this;
		const θ = rtheta + t * rdelta;
		const sinθ = sin(θ);
		const cosθ = cos(θ);
		const k = rdelta;

		return Vec.at(-rx * cosφ * sinθ * k - ry * sinφ * cosθ * k, -rx * sinφ * sinθ * k + ry * cosφ * cosθ * k);
	}

	transform(matrix: any) {
		// return arc_transform(this, matrix);
		const {arc, end, start} = this;
		let {rx, ry, sweep, phi} = this;
		const p1ˈ = start.transform(matrix);
		const p2_ = end.transform(matrix);
		const {rotate, scaleX, scaleY, skewX} = matrix.decompose();
		if (scaleX == scaleY && scaleX != 1) {
			rx = rx * scaleX;
			ry = ry * scaleX;
		}

		OUT: if (rotate || skewX || scaleX != 1 || scaleY != 1) {
			phi = (((phi + rotate) % 360) + 360) % 360; // from -30 -> 330

			// const M = phi ? matrix.rotate(phi) : matrix;
			const M = matrix;

			const {a, c, b, d} = M;
			const detT = a * d - b * c;
			const detT2 = detT * detT;
			if (!rx || !ry || !detT2) break OUT;
			const A = (d ** 2 / rx ** 2 + c ** 2 / ry ** 2) / detT2;
			const B = -((d * b) / rx ** 2 + (c * a) / ry ** 2) / detT2;
			const D = (b ** 2 / rx ** 2 + a ** 2 / ry ** 2) / detT2;
			const theta = atan2(-2 * B, D - A) / 2;
			// console.log('theta', theta_deg, theta, A, B, D, a, c, b, d, detT2);
			const DA = D - A;
			const l2 = 4 * B ** 2 + DA ** 2;
			const delta = l2 ? (0.5 * (-DA * DA - 4 * B * B)) / sqrt(l2) : 0;
			const half = (A + D) / 2;
			// if (skewX || scaleX != 1 || scaleY != 1) {
			// 	rx = 1.0 / sqrt(half + delta);
			// 	ry = 1.0 / sqrt(half - delta);
			// }

			// phi = (theta * 180.0) / PI;

			// return new Arc(
			// 	p1ˈ,
			// 	p2_,
			// 	rx,
			// 	ry,
			// 	phi,
			// 	arc,
			// 	detT > 0 ? this.sweep : this.sweep > 0 ? 0 : 1
			// );
			if (detT < 0) {
				sweep = !sweep;
			}
		}

		return new Arc(p1ˈ, p2_, rx, ry, phi, arc, sweep);

		// new_start = to_complex(tf.dot(to_point(curve.start)))
		// new_end = to_complex(tf.dot(to_point(curve.end)))
		// new_radius = to_complex(tf.dot(to_vector(curve.radius)))
		// if tf[0][0] * tf[1][1] >= 0.0:
		//     new_sweep = curve.sweep
		// else:
		//     new_sweep = not curve.sweep
		// return Arc(new_start, radius=new_radius, rotation=curve.rotation,
		//            large_arc=curve.large_arc, sweep=new_sweep, end=new_end)

		// const P1 = start.transform(matrix);
		// const P2 = end.transform(matrix);

		// new_start = to_complex(tf.dot(to_point(curve.start)))
		//   new_end = to_complex(tf.dot(to_point(curve.end)))

		//   # Based on https://math.stackexchange.com/questions/2349726/compute-the-major-and-minor-axis-of-an-ellipse-after-linearly-transforming-it
		//  const rx2 = rx *rx
		// const  ry2 = ry *ry

		//   Q = np.array([[1/rx2, 0], [0, 1/ry2]])
		//   invT = np.linalg.inv(tf[:2,:2])
		//   D = reduce(np.matmul, [invT.T, Q, invT])

		//   eigvals, eigvecs = np.linalg.eig(D)

		//   rx = 1 / np.sqrt(eigvals[0])
		//   ry = 1 / np.sqrt(eigvals[1])

		//   new_radius = complex(rx, ry)

		//   xeigvec = eigvecs[:, 0]
		//   rot = np.degrees(np.arccos(xeigvec[0]))

		//   if new_radius.real == 0 or new_radius.imag == 0 :
		//       return Line(new_start, new_end)
		//   else :
		//       return Arc(new_start, radius=new_radius, rotation=curve.rotation + rot,
		//                  large_arc=curve.large_arc, sweep=curve.sweep, end=new_end,
		//                  autoscale_radius=False)
	}

	reversed() {
		const {arc, end, start, rx, ry, sweep, phi} = this;
		return new Arc(end, start, rx, ry, phi, arc, sweep ? 0 : 1);
	}

	asCubic() {
		const {
			arc,
			end: {x: x2, y: y2},
			start: {x: x1, y: y1},
			rx,
			ry,
			sweep,
			phi,
			cx,
			cy,
			cosφ,
			sinφ,
			rdelta,
			rtheta,
		} = this;
		const segments = arcToCurve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
		// Degenerated arcs can be ignored by renderer, but should not be dropped
		// to avoid collisions with `S A S` and so on. Replace with empty line.
		if (segments.length === 0) {
			return [new Line([x1, y1], [x2, y2])];
		} else {
			return segments.map(function (s) {
				return new Cubic([s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]);
			});
		}
	}
}

// // const approximateArcLengthOfCurve = (
// // 	resolution: number,
// // 	pointOnCurveFunc: (t: number) => Vec
// // ) => {
// // 	// Resolution is the number of segments we use
// // 	resolution = resolution ? resolution : 500;

// // 	let resultantArcLength = 0;
// // 	const arcLengthMap = [];
// // 	const approximationLines = [];

// // 	let prevPoint = pointOnCurveFunc(0);
// // 	let nextPoint;
// // 	for (let i = 0; i < resolution; i++) {
// // 		const t = clamp(i * (1 / resolution), 0, 1);
// // 		nextPoint = pointOnCurveFunc(t);
// // 		resultantArcLength += distance(prevPoint, nextPoint);
// // 		approximationLines.push([prevPoint, nextPoint]);

// // 		arcLengthMap.push({
// // 			t: t,
// // 			arcLength: resultantArcLength,
// // 		});

// // 		prevPoint = nextPoint;
// // 	}
// // 	// Last stretch to the endpoint
// // 	nextPoint = pointOnCurveFunc(1);
// // 	approximationLines.push([prevPoint, nextPoint]);
// // 	resultantArcLength += distance(prevPoint, nextPoint);
// // 	arcLengthMap.push({
// // 		t: 1,
// // 		arcLength: resultantArcLength,
// // 	});

// // 	return {
// // 		arcLength: resultantArcLength,
// // 		arcLengthMap: arcLengthMap,
// // 		approximationLines: approximationLines,
// // 	};
// // };

// const mod = (x: number, m: number) => {
// 	return ((x % m) + m) % m;
// };

// const toRadians = (angle: number) => {
// 	return angle * (PI / 180);
// };

// const distance = (p0: any, start: any) => {
// 	return sqrt(pow(start.x - p0.x, 2) + pow(start.y - p0.y, 2));
// };

// const clamp = (val: number, min1: number, max1: number) => {
// 	return min(max(val, min1), max1);
// };

// const angleBetween = (v0: any, v1: any) => {
// 	const p = v0.x * v1.x + v0.y * v1.y;
// 	const n = sqrt(
// 		(pow(v0.x, 2) + pow(v0.y, 2)) * (pow(v1.x, 2) + pow(v1.y, 2))
// 	);
// 	const sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
// 	const angle = sign * acos(p / n);

// 	return angle;
// };

// function arc_transform(seg: Arc, M: any) {
// 	function NEARZERO(B) {
// 		if (abs(B) < 0.0000000000000001) return true;
// 		else return false;
// 	}
// 	let {rx, ry, phi, arc: large_arc_flag, sweep: sweep_flag, end} = seg;

// 	var rh, rv, rot;

// 	var m = []; // matrix representation of transformed ellipse
// 	var A, B, C; // ellipse implicit equation:
// 	var ac, A2, C2; // helpers for angle and halfaxis-extraction.
// 	rh = rx;
// 	rv = ry;

// 	phi = phi * (PI / 180); // deg->rad
// 	rot = phi;

// 	const sinφ = sin(rot);
// 	const cosφ = cos(rot);
// 	const {a, b, c, d} = M;

// 	// build ellipse representation matrix (unit circle transformation).
// 	// the 2x2 matrix multiplication with the upper 2x2 of a_mat is inlined.
// 	m[0] = a * +rh * cosφ + c * rh * sinφ;
// 	m[1] = b * +rh * cosφ + d * rh * sinφ;
// 	m[2] = a * -rv * sinφ + c * rv * cosφ;
// 	m[3] = b * -rv * sinφ + d * rv * cosφ;

// 	// to implict equation (centered)
// 	A = m[0] * m[0] + m[2] * m[2];
// 	C = m[1] * m[1] + m[3] * m[3];
// 	B = (m[0] * m[1] + m[2] * m[3]) * 2.0;

// 	// precalculate distance A to C
// 	ac = A - C;

// 	// convert implicit equation to angle and halfaxis:
// 	if (NEARZERO(B)) {
// 		phi = 0;
// 		A2 = A;
// 		C2 = C;
// 	} else if (NEARZERO(ac)) {
// 		A2 = A + B * 0.5;
// 		C2 = A - B * 0.5;
// 		phi = PI / 4.0;
// 	} else {
// 		// Precalculate radical:
// 		var K = 1 + (B * B) / (ac * ac);

// 		// Clamp (precision issues might need this.. not likely, but better save than sorry)
// 		if (K < 0) K = 0;
// 		else K = sqrt(K);

// 		A2 = 0.5 * (A + C + K * ac);
// 		C2 = 0.5 * (A + C - K * ac);
// 		phi = 0.5 * atan2(B, ac);
// 	}

// 	// This can get slightly below zero due to rounding issues.
// 	// it'sinφ save to clamp to zero in this case (this yields a zero length halfaxis)
// 	if (A2 < 0) A2 = 0;
// 	else A2 = sqrt(A2);
// 	if (C2 < 0) C2 = 0;
// 	else C2 = sqrt(C2);

// 	// now A2 and C2 are half-axis:
// 	if (ac <= 0) {
// 		ry = A2;
// 		rx = C2;
// 	} else {
// 		ry = C2;
// 		rx = A2;
// 	}

// 	// If the transformation matrix contain a mirror-component
// 	// winding order of the ellise needs to be changed.
// 	if (a * d - b * c < 0) {
// 		if (!sweep_flag) sweep_flag = 1;
// 		else sweep_flag = 0;
// 	}

// 	// Radians back to degrees
// 	phi = (phi * 180) / PI;
// 	assert.ok(Number.isFinite(cosφ), `cosφ: ${cosφ}`);
// 	return Arc.fromEndPoint(
// 		seg.start.transform(M),
// 		rx,
// 		ry,
// 		phi,
// 		large_arc_flag,
// 		sweep_flag,
// 		seg.end.transform(M)
// 	);
// }
