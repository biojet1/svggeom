import { Point } from "./point.js";

const { abs, tan, cos, sin, sqrt, acos, PI, ceil, max } = Math;
const TAU = PI * 2;

export function cossin(θ: number) {
	θ = ((θ % 360) + 360) % 360; // from -30 -> 330
	switch (θ) {
		case 0:
			return [+1, +0];
		case 30:
			return [sqrt(3) / 2, 0.5];
		case 45:
			return [sqrt(2) / 2, sqrt(2) / 2];
		case 60:
			return [0.5, sqrt(3) / 2];
		case 90:
			return [+0, +1];
		case 120:
			return [-0.5, sqrt(3) / 2];
		case 135:
			return [-sqrt(2) / 2, sqrt(2) / 2];
		case 150:
			return [-sqrt(3) / 2, 0.5];
		case 180:
			return [-1, +0];
		case 210:
			return [-sqrt(3) / 2, -0.5];
		case 225:
			return [-sqrt(2) / 2, -sqrt(2) / 2];
		case 240:
			return [-0.5, -sqrt(3) / 2];
		case 270:
			return [-0, -1];
		case 300:
			return [0.5, -sqrt(3) / 2];
		case 315:
			return [sqrt(2) / 2, -sqrt(2) / 2];
		case 330:
			return [sqrt(3) / 2, -0.5];
		default:
			const r = (θ * PI) / 180;
			return [cos(r), sin(r)];
	}
}

export function unit_vector_angle(
	ux: number,
	uy: number,
	vx: number,
	vy: number
) {
	const sign = ux * vy - uy * vx < 0 ? -1 : 1;
	var dot = ux * vx + uy * vy;

	// Add this to work with arbitrary vectors:
	// dot /= Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);

	// rounding errors, e.g. -1.0000000000000002 can screw up this
	if (dot > 1.0) {
		dot = 1.0;
	} else if (dot < -1.0) {
		dot = -1.0;
	}
	return sign * acos(dot);
}

const LENGTH_MIN_DEPTH = 17;
const LENGTH_ERROR = 1e-12;
interface PointAt {
	pointAt(f: number): Point;
}

export function segment_length(
	curve: PointAt,
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

export function arcParams(
	x1: number,
	y1: number,
	rx: number,
	ry: number,
	φ: number,
	arc: boolean,
	sweep: boolean,
	x2: number,
	y2: number
) {
	// φ = ((φ % 360) + 360) % 360; // from -30 -> 330
	const [cosφ, sinφ] = cossin(φ);

	// https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
	// (eq. 5.1)
	// p1ˈ = when mid point of p1 and p2 is at 0,0 rotated to line up ellipse axes
	// transaltion discarded

	const x1ˈ = (cosφ * (x1 - x2) + sinφ * (y1 - y2)) / 2;
	const y1ˈ = (-sinφ * (x1 - x2) + cosφ * (y1 - y2)) / 2;

	if (1) {
		// https://svgwg.org/svg2-draft/implnote.html#ArcCorrectionOutOfRangeRadii
		// B.2.5. Correction of out-of-range radii
		if (!rx || !ry) {
			// Step 1: Ensure radii are non-zero
			// console.log([rx, ry], φ, [arc, sweep], p1, p2);
			throw new Error("Not an ellipse");
		} else {
			// Step 2: Ensure radii are positive (eq. 6.1)
			rx = abs(rx);
			ry = abs(ry);
		}
		// Step 3: Ensure radii are large enough
	}

	const rxSq = rx ** 2;
	const rySq = ry ** 2;
	const y1ˈSq = y1ˈ ** 2;
	const x1ˈSq = x1ˈ ** 2;

	// (eq. 6.2)
	// Make sure the radius fit with the arc and correct if neccessary
	if (1) {
		const Λ = x1ˈ ** 2 / rxSq + y1ˈ ** 2 / rySq;
		// (eq. 6.3)
		if (Λ > 1) {
			const m = sqrt(Λ);
			rx = m * rx;
			ry = m * ry;
		}
	}
	// (eq. 5.2)

	// (eq. 5.3)

	const s1 = rxSq * y1ˈSq;
	const s2 = rySq * x1ˈSq;
	const v1 = (rxSq * rySq - s1 - s2) / (s1 + s2);
	const m1 = v1 <= 0 ? 0 : sqrt(v1) * (!!arc === !!sweep ? -1 : 1);
	let cxˈ = (rx * y1ˈ * m1) / ry;
	let cyˈ = (-ry * x1ˈ * m1) / rx;
	// (eq. 5.3)
	const cx = cosφ * cxˈ - sinφ * cyˈ + (x1 + x2) / 2;
	const cy = sinφ * cxˈ + cosφ * cyˈ + (y1 + y2) / 2;
	const v1x = (x1ˈ - cxˈ) / rx;
	const v1y = (y1ˈ - cyˈ) / ry;
	const v2x = (-x1ˈ - cxˈ) / rx;
	const v2y = (-y1ˈ - cyˈ) / ry;

	const theta1 = unit_vector_angle(1, 0, v1x, v1y);
	const delta_theta = unit_vector_angle(v1x, v1y, v2x, v2y);

	// if (!sweep && delta_theta > 0) {
	// 	delta_theta -= PI * 2;
	// }
	// if (sweep && delta_theta < 0) {
	// 	delta_theta += PI * 2;
	// }
	// delta_theta += ;

	return [
		φ,
		rx,
		ry,
		sinφ,
		cosφ,
		cx,
		cy,
		theta1,
		delta_theta +
			(sweep ? (delta_theta < 0 ? +TAU : 0) : delta_theta > 0 ? -TAU : 0),
	];
}

function approximate_unit_arc(theta1: number, delta_theta: number) {
	var alpha = (4 / 3) * tan(delta_theta / 4);

	var x1 = cos(theta1);
	var y1 = sin(theta1);
	var x2 = cos(theta1 + delta_theta);
	var y2 = sin(theta1 + delta_theta);

	return [
		x1,
		y1,
		x1 - y1 * alpha,
		y1 + x1 * alpha,
		x2 + y2 * alpha,
		y2 - x2 * alpha,
		x2,
		y2,
	];
}

export function arcToCurve(
	rx: number,
	ry: number,
	cx: number,
	cy: number,
	sin_phi: number,
	cos_phi: number,
	theta1: number,
	delta_theta: number
) {
	var result = [];

	// Split an arc to multiple segments, so each segment
	// will be less than τ/4 (= 90°)
	//
	const segments = max(ceil(abs(delta_theta) / (TAU / 12)), 1);
	delta_theta /= segments;

	for (var i = 0; i < segments; i++) {
		result.push(approximate_unit_arc(theta1, delta_theta));
		theta1 += delta_theta;
	}

	// We have a bezier approximation of a unit circle,
	// now need to transform back to the original ellipse
	//
	return result.map(function (curve) {
		for (let i = 0; i < curve.length; i += 2) {
			let x = curve[i + 0];
			let y = curve[i + 1];

			// scale
			x *= rx;
			y *= ry;

			// rotate
			const xp = cos_phi * x - sin_phi * y;
			const yp = sin_phi * x + cos_phi * y;

			// translate
			curve[i + 0] = xp + cx;
			curve[i + 1] = yp + cy;
		}

		return curve;
	});
}
