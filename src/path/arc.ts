import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment, Line } from "./index.js";
import { Cubic } from "./cubic.js";
import { Matrix } from "../matrix.js";
// import assert from "assert";
import { a2c } from "./a2c.js";
const { PI } = Math;
export class Arc extends Segment {
	readonly rx: number;
	readonly ry: number;
	readonly phi: number;
	readonly arc: number;
	readonly sweep: number;
	//
	readonly cosφ: number;
	readonly sinφ: number;
	readonly cen: Point;
	readonly rtheta: number;
	readonly rdelta: number;
	private constructor(
		p1: Point | number[],
		p2: Point | number[],
		rx: number,
		ry: number,
		φ: number,
		arc: boolean | number,
		sweep: boolean | number
	) {
		p1 = Point.new(p1);
		p2 = Point.new(p2);

		if (!(Number.isFinite(φ) && Number.isFinite(rx) && Number.isFinite(ry)))
			throw Error(`${JSON.stringify(arguments)}`);

		const ec = pointOnEllipticalArc(p1, rx, ry, φ, !!arc, !!sweep, p2, 1);

		// https://www.w3.org/TR/SVG/implnote.html#ArcCorrectionOutOfRangeRadii
		if (!rx || !ry) {
			console.log([rx, ry], φ, [arc, sweep], p1, p2);
			throw new Error("Not an ellipse");

			// return new Line(p1, p2);
		}
		super(p1, p2);

		this.phi = φ;
		this.arc = arc ? 1 : 0;
		this.sweep = sweep ? 1 : 0;
		φ = ((φ % 360) + 360) % 360; // from -30 -> 330
		rx = Math.abs(rx);
		ry = Math.abs(ry);
		// Calculate cos and sin of angle phi
		const φrad = (φ * PI) / 180;
		const cosφ = Math.cos(φrad);
		const sinφ = Math.sin(φrad);
		const rotM = Matrix.hexad(cosφ, -sinφ, sinφ, cosφ, 0, 0);
		// https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
		// (eq. 5.1)
		// p1ˈ = when mid point of p1 and p2 is at 0,0 rotated to line up ellipse axes
		// transaltion discarded
		const p1ˈ = Point.at((p1.x - p2.x) / 2, (p1.y - p2.y) / 2).transform(
			rotM
		);
		// (eq. 6.2)
		// Make sure the radius fit with the arc and correct if neccessary
		const rxSq = rx ** 2;
		const rySq = ry ** 2;
		const ratio = p1ˈ.x ** 2 / rxSq + p1ˈ.y ** 2 / rySq;
		// (eq. 6.3)
		// if (ratio < 0) {
		// 	// due to rounding errors it might be e.g. -1.3877787807814457e-17
		// 	ratio = 0;
		// }
		if (ratio > 1) {
			rx = Math.sqrt(ratio) * rx;
			ry = Math.sqrt(ratio) * ry;
		}
		// (eq. 5.2)
		const divisor1 = rxSq * p1ˈ.y ** 2;
		const divisor2 = rySq * p1ˈ.x ** 2;
		const dividend = rxSq * rySq - divisor1 - divisor2;
		const v1 = dividend / (divisor1 + divisor2);
		const mult = v1 <= 0 ? 0 : Math.sqrt(v1);

		let cenˈ = Point.at((rx * p1ˈ.y) / ry, (-ry * p1ˈ.x) / rx).mul(mult);
		if (this.arc === this.sweep) cenˈ = cenˈ.mul(-1);
		// (eq. 5.3)
		const cen = cenˈ
			.transform(rotM)
			.add(Point.at((p1.x + p2.x) / 2, (p1.y + p2.y) / 2));
		const anglePoint = Point.at(
			(p1ˈ.x - cenˈ.x) / rx,
			(p1ˈ.y - cenˈ.y) / ry
		);
		/* For eq. 5.4 see angleTo function */
		// (eq. 5.5)
		const θ = Point.at(1, 0).angleTo(anglePoint);
		if (!(Number.isFinite(θ) && Number.isFinite(rx) && Number.isFinite(ry)))
			throw Error(`${anglePoint}: ${θ}`);

		// (eq. 5.6)
		let Δθ = anglePoint.angleTo(
			Point.at((-p1ˈ.x - cenˈ.x) / rx, (-p1ˈ.y - cenˈ.y) / ry)
		);
		Δθ = Δθ % (2 * PI);
		if (!sweep && Δθ > 0) Δθ -= 2 * PI;
		if (sweep && Δθ < 0) Δθ += 2 * PI;
		this.rx = rx;
		this.ry = ry;
		this.cen = cen;
		this.cosφ = cosφ;
		this.sinφ = sinφ;
		this.rtheta = θ;
		this.rdelta = Δθ;
		// try {
		// 	assert.equal(this.cen.y, ec.ellipticalArcCenter.y);
		// 	assert.equal(this.cen.x, ec.ellipticalArcCenter.x);
		// 	assert.equal(this.rx, ec.resultantRx);
		// 	assert.equal(this.ry, ec.resultantRy);
		// 	assert.equal(p1ˈ.y, ec.transformedPoint.y);
		// 	assert.equal(p1ˈ.x, ec.transformedPoint.x);
		// 	assert.equal(θ, ec.ellipticalArcStartAngle);
		// 	// console.log(this);
		// } catch (err) {
		// 	console.log(this, ec);
		// 	throw err;
		// }

		// x:
		// 	Math.cos(xAxisRotationRadians) * ellipseComponentX -
		// 	Math.sin(xAxisRotationRadians) * ellipseComponentY +
		// 	center.x,
		// y:
		// 	Math.sin(xAxisRotationRadians) * ellipseComponentX +
		// 	Math.cos(xAxisRotationRadians) * ellipseComponentY +
		// 	center.y,
		// ellipticalArcStartAngle: startAngle,
		// ellipticalArcEndAngle: startAngle + sweepAngle,
		// ellipticalArcAngle: angle,
	}
	static fromEndPoint(
		p1: any,
		rx: number,
		ry: number,
		φ: number,
		arc: boolean | number,
		sweep: boolean | number,
		p2: any
	): Segment {
		if (!rx || !ry) {
			return new Line(p1, p2);
		}
		p1 = Point.new(p1);
		p2 = Point.new(p2);
		return new Arc(p1, p2, rx, ry, φ, arc, sweep);
	}
	static fromCenterForm(
		c: Point,
		rx: number,
		ry: number,
		φ: number,
		θ: number,
		Δθ: number
	) {
		const cosφ = Math.cos((φ / 180) * PI);
		const sinφ = Math.sin((φ / 180) * PI);
		const m = Matrix.hexad(cosφ, sinφ, -sinφ, cosφ, 0, 0);
		const p1 = Point.at(
			rx * Math.cos((θ / 180) * PI),
			ry * Math.sin((θ / 180) * PI)
		)
			.transform(m)
			.add(c);
		const p2 = Point.at(
			rx * Math.cos(((θ + Δθ) / 180) * PI),
			ry * Math.sin(((θ + Δθ) / 180) * PI)
		)
			.transform(m)
			.add(c);
		const arc = Math.abs(Δθ) > 180 ? 1 : 0;
		const sweep = Δθ > 0 ? 1 : 0;
		return new Arc(p1, p2, rx, ry, φ, arc, sweep);
	}
	bbox() {
		const { rx, ry, cosφ, sinφ, p1, p2, rdelta, rtheta, phi } = this;
		const { PI } = Math;
		let atan_x, atan_y;
		if (cosφ == 0) {
			atan_x = PI / 2;
			atan_y = 0;
		} else if (sinφ == 0) {
			atan_x = 0;
			atan_y = PI / 2;
		} else {
			const tanφ = Math.tan(phi);
			atan_x = Math.atan(-(ry / rx) * tanφ);
			atan_y = Math.atan(ry / rx / tanφ);
		}
		const xtrema = [p1.x, p2.x];
		const ytrema = [p1.y, p2.y];
		function angle_inv(ang: number, k: number) {
			return (ang + PI * k - rtheta) / rdelta;
		}
		for (let k = -4; k < 5; ++k) {
			const tx = angle_inv(atan_x, k);
			const ty = angle_inv(atan_y, k);
			0 <= tx && tx <= 1 && xtrema.push(this.pointAt(tx).x);
			0 <= ty && ty <= 1 && ytrema.push(this.pointAt(ty).y);
		}
		const [xmin, xmax] = [Math.min(...xtrema), Math.max(...xtrema)];
		const [ymin, ymax] = [Math.min(...ytrema), Math.max(...ytrema)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}
	clone() {
		return new Arc(
			this.p1,
			this.p2,
			this.rx,
			this.ry,
			this.phi,
			this.arc,
			this.sweep
		);
	}
	length() {
		const { p1, p2 } = this;
		if (p1.equals(p2)) return 0;

		return segment_length(this, 0, 1, p1, p2);
		// const length = this.p2.sub(this.p1).abs();
		// const ret = this.splitAt(0.5);
		// const len1 = ret[0].p2.sub(ret[0].p1).abs();
		// const len2 = ret[1].p2.sub(ret[1].p1).abs();
		// if (len1 + len2 - length < 0.00001) {
		// 	return len1 + len2;
		// }
		// return ret[0].length() + ret[1].length();
	}
	pointAt(t: number) {
		const { p1, p2 } = this;
		if (p1.equals(p2)) {
			return p1.clone();
		} else if (t <= 0) {
			return p1;
		} else if (t >= 1) {
			return p2;
		}
		const { rx, ry, cosφ, sinφ, rtheta, rdelta, cen } = this;
		const θ = (((180 * rtheta + 180 * rdelta * t) / PI) * PI) / 180;
		const sinθ = Math.sin(θ);
		const cosθ = Math.cos(θ);
		// (eq. 3.1) https://svgwg.org/svg2-draft/implnote.html#ArcParameterizationAlternatives
		return Point.at(
			rx * cosφ * cosθ - ry * sinφ * sinθ + cen.x,
			rx * sinφ * cosθ + ry * cosφ * sinθ + cen.y
		);
	}
	splitAt(t: number) {
		const { rx, ry, phi, sweep, rdelta, p1, p2 } = this;
		const deltaA = Math.abs(rdelta);
		const delta1 = deltaA * t;
		const delta2 = deltaA * (1 - t);
		const pT = this.pointAt(t);
		return [
			new Arc(p1, pT, rx, ry, phi, delta1 > PI, sweep),
			new Arc(pT, p2, rx, ry, phi, delta2 > PI, sweep),
		];
	}

	toPathFragment() {
		return [
			"A",
			this.rx,
			this.ry,
			this.phi,
			this.arc,
			this.sweep,
			this.p2.x,
			this.p2.y,
		];
	}
	// toString() {
	// 	return `p1: ${this.p1.x.toFixed(4)} ${this.p1.y.toFixed(
	// 		4
	// 	)}, p2: ${this.p2.x.toFixed(4)} ${this.p2.y.toFixed(
	// 		4
	// 	)}, cen: ${this.cen.x.toFixed(4)} ${this.cen.y.toFixed(
	// 		4
	// 	)} theta: ${this.theta.toFixed(4)}, theta2: ${this.theta2.toFixed(
	// 		4
	// 	)}, delta: ${this.delta.toFixed(4)}, large: ${this.arc}, sweep: ${
	// 		this.sweep
	// 	}`;
	// }
	slopeAt(t: number): Point {
		// throw new Error('Not implemented');
		const { rx, ry, cosφ, sinφ, rdelta, rtheta } = this;
		const θ = rtheta + t * rdelta;
		const sinθ = Math.sin(θ);
		const cosθ = Math.cos(θ);
		const k = rdelta;

		return Point.at(
			-rx * cosφ * sinθ * k - ry * sinφ * cosθ * k,
			-rx * sinφ * sinθ * k + ry * cosφ * cosθ * k
		);
	}

	transform(matrix: any) {
		// return arc_transform(this, matrix);
		const { arc, p2, p1 } = this;
		let { rx, ry, sweep, phi } = this;
		const p1ˈ = p1.transform(matrix);
		const p2_ = p2.transform(matrix);
		const { rotate, scaleX, scaleY, skewX } = matrix.decompose();
		if (scaleX == scaleY && scaleX != 1) {
			rx *= scaleX;
			ry *= scaleX;
		}

		OUT: if (rotate || skewX || scaleX != 1 || scaleY != 1) {
			phi = (((phi + rotate) % 360) + 360) % 360; // from -30 -> 330

			// const M = phi ? matrix.rotate(phi) : matrix;
			const M = matrix;

			const { a, c, b, d } = M;
			const detT = a * d - b * c;
			const detT2 = detT * detT;
			if (!rx || !ry || !detT2) break OUT;
			const A = (d ** 2 / rx ** 2 + c ** 2 / ry ** 2) / detT2;
			const B = -((d * b) / rx ** 2 + (c * a) / ry ** 2) / detT2;
			const D = (b ** 2 / rx ** 2 + a ** 2 / ry ** 2) / detT2;
			const theta = Math.atan2(-2 * B, D - A) / 2;
			// console.log('theta', theta_deg, theta, A, B, D, a, c, b, d, detT2);
			const DA = D - A;
			const l2 = 4 * B ** 2 + DA ** 2;
			const delta = l2
				? (0.5 * (-DA * DA - 4 * B * B)) / Math.sqrt(l2)
				: 0;
			const half = (A + D) / 2;
			// if (skewX || scaleX != 1 || scaleY != 1) {
			// 	rx = 1.0 / Math.sqrt(half + delta);
			// 	ry = 1.0 / Math.sqrt(half - delta);
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
				sweep = sweep ? 0 : 1;
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

		// const P1 = p1.transform(matrix);
		// const P2 = p2.transform(matrix);

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
		const { arc, p2, p1, rx, ry, sweep, phi } = this;
		return new Arc(p2, p1, rx, ry, phi, arc, sweep ? 0 : 1);
	}

	asCubic() {
		const {
			arc,
			p2: { x: x2, y: y2 },
			p1: { x: x1, y: y1 },
			rx,
			ry,
			sweep,
			phi,
		} = this;
		const segments = a2c(x1, y1, x2, y2, arc, sweep, rx, ry, phi);

		// const segments = a2c(x, y, nextX, nextY, s[4], s[5], s[1], s[2], s[3]);

		// Degenerated arcs can be ignored by renderer, but should not be dropped
		// to avoid collisions with `S A S` and so on. Replace with empty line.
		if (segments.length === 0) {
			return [new Line([x1, y1], [x2, y2])];
		} else {
			return segments.map(function (s) {
				return new Cubic(
					[s[0], s[1]],
					[s[2], s[3]],
					[s[4], s[5]],
					[s[6], s[7]]
				);
			});
		}

		// def as_cubic_curves(self, arc_required=None):
		// if (!arc_required) {
		// 	const sweep_limit = PI / 6; // tau / 12.0
		// 	// arc_required = parseInt(Math.ceil(Math.abs(rdelta) / sweep_limit));
		// 	if (!arc_required) {
		// 		return;
		// 	}
		// }

		//     if arc_required is None:
		//         sweep_limit = tau / 12.0
		//         arc_required = int(ceil(abs(self.sweep) / sweep_limit))
		//         if arc_required == 0:
		//             return
		// const t_slice = rdelta / arc_required;
		//     t_slice = self.sweep / float(arc_required)

		//     theta = self.get_rotation()
		//     rx = self.rx
		//     ry = self.ry
		//     p_start = self.start
		//     current_t = self.get_start_t()
		//     x0 = self.center.x
		//     y0 = self.center.y
		//     cos_theta = cos(theta)
		//     sin_theta = sin(theta)

		//     for i in range(0, arc_required):
		//         next_t = current_t + t_slice

		//         alpha = (
		//             sin(t_slice) * (sqrt(4 + 3 * pow(tan((t_slice) / 2.0), 2)) - 1) / 3.0
		//         )

		//         cos_start_t = cos(current_t)
		//         sin_start_t = sin(current_t)

		//         ePrimen1x = -rx * cos_theta * sin_start_t - ry * sin_theta * cos_start_t
		//         ePrimen1y = -rx * sin_theta * sin_start_t + ry * cos_theta * cos_start_t

		//         cos_end_t = cos(next_t)
		//         sin_end_t = sin(next_t)

		//         p2En2x = x0 + rx * cos_end_t * cos_theta - ry * sin_end_t * sin_theta
		//         p2En2y = y0 + rx * cos_end_t * sin_theta + ry * sin_end_t * cos_theta
		//         p_end = (p2En2x, p2En2y)
		//         if i == arc_required - 1:
		//             p_end = self.end

		//         ePrimen2x = -rx * cos_theta * sin_end_t - ry * sin_theta * cos_end_t
		//         ePrimen2y = -rx * sin_theta * sin_end_t + ry * cos_theta * cos_end_t

		//         p_c1 = (p_start[0] + alpha * ePrimen1x, p_start[1] + alpha * ePrimen1y)
		//         p_c2 = (p_end[0] - alpha * ePrimen2x, p_end[1] - alpha * ePrimen2y)

		//         yield CubicBezier(p_start, p_c1, p_c2, p_end)
		//         p_start = Point(p_end)
		//         current_t = next_t
	}
}
const LENGTH_MIN_DEPTH = 17;
const LENGTH_ERROR = 1e-12;
// const LENGTH_MIN_DEPTH = 100;
// const LENGTH_ERROR = 1;
// def segment_length(curve, start, end, start_point, end_point,
//                    error=LENGTH_ERROR, min_depth=LENGTH_MIN_DEPTH, depth=0):
//     """Recursively approximates the length by straight lines"""
//     mid = (start + end)/2
//     mid_point = curve.point(mid)
//     length = abs(end_point - start_point)
//     first_half = abs(mid_point - start_point)
//     second_half = abs(end_point - mid_point)
//     length2 = first_half + second_half
//     if (length2 - length > error) or (depth < min_depth):
//         # Calculate the length of each segment:
//         depth += 1
//         return (segment_length(curve, start, mid, start_point, mid_point,
//                                error, min_depth, depth) +
//                 segment_length(curve, mid, end, mid_point, end_point,
//                                error, min_depth, depth))
//     # This is accurate enough.
//     return length2
function segment_length(
	curve: Arc,
	start: number,
	end: number,
	start_point: Point,
	end_point: Point,
	error = LENGTH_ERROR,
	min_depth = LENGTH_MIN_DEPTH,
	depth = 0
): number {
	const mid = (start + end) / 2;
	const mid_point = curve.pointAt(mid);
	const length = end_point.sub(start_point).abs();
	const first_half = mid_point.sub(start_point).abs();
	const second_half = end_point.sub(mid_point).abs();
	const length2 = first_half + second_half;
	if (length2 - length > error || depth < min_depth) {
		// Calculate the length of each segment:
		depth += 1;
		return (
			segment_length(
				curve,
				start,
				mid,
				start_point,
				mid_point,
				error,
				min_depth,
				depth
			) +
			segment_length(
				curve,
				mid,
				end,
				mid_point,
				end_point,
				error,
				min_depth,
				depth
			)
		);
	}
	// This is accurate enough.
	return length2;
}

// interface PointOnEllipticalArc {
// 	x: number;
// 	y: number;
// 	ellipticalArcAngle: number;
// }

function pointOnEllipticalArc(
	p0: Point,
	rx: number,
	ry: number,
	xAxisRotation: number,
	largeArcFlag: boolean,
	sweepFlag: boolean,
	p1: Point,
	t: number
): any {
	// In accordance to: http://www.w3.org/TR/SVG/implnote.html#ArcOutOfRangeParameters
	rx = Math.abs(rx);
	ry = Math.abs(ry);
	xAxisRotation = mod(xAxisRotation, 360);
	const xAxisRotationRadians = toRadians(xAxisRotation);
	// If the endpoints are identical, then this is equivalent to omitting the elliptical arc segment entirely.
	if (p0.x === p1.x && p0.y === p1.y) {
		return { x: p0.x, y: p0.y, ellipticalArcAngle: 0 }; // Check if angle is correct
	}

	// If rx = 0 or ry = 0 then this arc is treated as a straight line segment joining the endpoints.
	if (rx === 0 || ry === 0) {
		//return this.pointOnLine(p0, p1, t);
		return { x: 0, y: 0, ellipticalArcAngle: 0 }; // Check if angle is correct
	}

	// Following "Conversion from endpoint to center parameterization"
	// http://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter

	// Step #1: Compute transformedPoint
	const dx = (p0.x - p1.x) / 2;
	const dy = (p0.y - p1.y) / 2;
	const transformedPoint = {
		x:
			Math.cos(xAxisRotationRadians) * dx +
			Math.sin(xAxisRotationRadians) * dy,
		y:
			-Math.sin(xAxisRotationRadians) * dx +
			Math.cos(xAxisRotationRadians) * dy,
	};
	// Ensure radii are large enough
	const radiiCheck =
		Math.pow(transformedPoint.x, 2) / Math.pow(rx, 2) +
		Math.pow(transformedPoint.y, 2) / Math.pow(ry, 2);
	if (radiiCheck > 1) {
		rx = Math.sqrt(radiiCheck) * rx;
		ry = Math.sqrt(radiiCheck) * ry;
	}

	// Step #2: Compute transformedCenter
	const cSquareNumerator =
		Math.pow(rx, 2) * Math.pow(ry, 2) -
		Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) -
		Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
	const cSquareRootDenom =
		Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) +
		Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
	let cRadicand = cSquareNumerator / cSquareRootDenom;
	// Make sure this never drops below zero because of precision
	cRadicand = cRadicand < 0 ? 0 : cRadicand;
	const cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand);
	const transformedCenter = {
		x: cCoef * ((rx * transformedPoint.y) / ry),
		y: cCoef * (-(ry * transformedPoint.x) / rx),
	};

	// Step #3: Compute center
	const center = {
		x:
			Math.cos(xAxisRotationRadians) * transformedCenter.x -
			Math.sin(xAxisRotationRadians) * transformedCenter.y +
			(p0.x + p1.x) / 2,
		y:
			Math.sin(xAxisRotationRadians) * transformedCenter.x +
			Math.cos(xAxisRotationRadians) * transformedCenter.y +
			(p0.y + p1.y) / 2,
	};

	// Step #4: Compute start/sweep angles
	// Start angle of the elliptical arc prior to the stretch and rotate operations.
	// Difference between the start and end angles
	const startVector = {
		x: (transformedPoint.x - transformedCenter.x) / rx,
		y: (transformedPoint.y - transformedCenter.y) / ry,
	};
	const startAngle = angleBetween(
		{
			x: 1,
			y: 0,
		},
		startVector
	);

	const endVector = {
		x: (-transformedPoint.x - transformedCenter.x) / rx,
		y: (-transformedPoint.y - transformedCenter.y) / ry,
	};
	let sweepAngle = angleBetween(startVector, endVector);

	if (!sweepFlag && sweepAngle > 0) {
		sweepAngle -= 2 * PI;
	} else if (sweepFlag && sweepAngle < 0) {
		sweepAngle += 2 * PI;
	}
	// We use % instead of `mod(..)` because we want it to be -360deg to 360deg(but actually in radians)
	sweepAngle %= 2 * PI;

	// From http://www.w3.org/TR/SVG/implnote.html#ArcParameterizationAlternatives
	const angle = startAngle + sweepAngle * t;
	const ellipseComponentX = rx * Math.cos(angle);
	const ellipseComponentY = ry * Math.sin(angle);

	const point = {
		x:
			Math.cos(xAxisRotationRadians) * ellipseComponentX -
			Math.sin(xAxisRotationRadians) * ellipseComponentY +
			center.x,
		y:
			Math.sin(xAxisRotationRadians) * ellipseComponentX +
			Math.cos(xAxisRotationRadians) * ellipseComponentY +
			center.y,
		ellipticalArcStartAngle: startAngle,
		ellipticalArcEndAngle: startAngle + sweepAngle,
		ellipticalArcAngle: angle,
		ellipticalArcCenter: center,
		resultantRx: rx,
		resultantRy: ry,
		transformedPoint: transformedPoint,
	};

	return point;
}

// const approximateArcLengthOfCurve = (
// 	resolution: number,
// 	pointOnCurveFunc: (t: number) => Point
// ) => {
// 	// Resolution is the number of segments we use
// 	resolution = resolution ? resolution : 500;

// 	let resultantArcLength = 0;
// 	const arcLengthMap = [];
// 	const approximationLines = [];

// 	let prevPoint = pointOnCurveFunc(0);
// 	let nextPoint;
// 	for (let i = 0; i < resolution; i++) {
// 		const t = clamp(i * (1 / resolution), 0, 1);
// 		nextPoint = pointOnCurveFunc(t);
// 		resultantArcLength += distance(prevPoint, nextPoint);
// 		approximationLines.push([prevPoint, nextPoint]);

// 		arcLengthMap.push({
// 			t: t,
// 			arcLength: resultantArcLength,
// 		});

// 		prevPoint = nextPoint;
// 	}
// 	// Last stretch to the endpoint
// 	nextPoint = pointOnCurveFunc(1);
// 	approximationLines.push([prevPoint, nextPoint]);
// 	resultantArcLength += distance(prevPoint, nextPoint);
// 	arcLengthMap.push({
// 		t: 1,
// 		arcLength: resultantArcLength,
// 	});

// 	return {
// 		arcLength: resultantArcLength,
// 		arcLengthMap: arcLengthMap,
// 		approximationLines: approximationLines,
// 	};
// };

const mod = (x: number, m: number) => {
	return ((x % m) + m) % m;
};

const toRadians = (angle: number) => {
	return angle * (PI / 180);
};

const distance = (p0: any, p1: any) => {
	return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
};

const clamp = (val: number, min: number, max: number) => {
	return Math.min(Math.max(val, min), max);
};

const angleBetween = (v0: any, v1: any) => {
	const p = v0.x * v1.x + v0.y * v1.y;
	const n = Math.sqrt(
		(Math.pow(v0.x, 2) + Math.pow(v0.y, 2)) *
			(Math.pow(v1.x, 2) + Math.pow(v1.y, 2))
	);
	const sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
	const angle = sign * Math.acos(p / n);

	return angle;
};

// function arc_transform(seg: Arc, M: any) {
// 	function NEARZERO(B) {
// 		if (Math.abs(B) < 0.0000000000000001) return true;
// 		else return false;
// 	}
// 	let {rx, ry, phi, arc: large_arc_flag, sweep: sweep_flag, p2} = seg;

// 	var rh, rv, rot;

// 	var m = []; // matrix representation of transformed ellipse
// 	var A, B, C; // ellipse implicit equation:
// 	var ac, A2, C2; // helpers for angle and halfaxis-extraction.
// 	rh = rx;
// 	rv = ry;

// 	phi = phi * (PI / 180); // deg->rad
// 	rot = phi;

// 	const sinφ = Math.sin(rot);
// 	const cosφ = Math.cos(rot);
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
// 		else K = Math.sqrt(K);

// 		A2 = 0.5 * (A + C + K * ac);
// 		C2 = 0.5 * (A + C - K * ac);
// 		phi = 0.5 * Math.atan2(B, ac);
// 	}

// 	// This can get slightly below zero due to rounding issues.
// 	// it'sinφ save to clamp to zero in this case (this yields a zero length halfaxis)
// 	if (A2 < 0) A2 = 0;
// 	else A2 = Math.sqrt(A2);
// 	if (C2 < 0) C2 = 0;
// 	else C2 = Math.sqrt(C2);

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
// 		seg.p1.transform(M),
// 		rx,
// 		ry,
// 		phi,
// 		large_arc_flag,
// 		sweep_flag,
// 		seg.p2.transform(M)
// 	);
// }
