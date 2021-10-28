"uses strict";
import { Ray, Point } from "../dist/index.js";
import "./utils.js";
import test from "tap";
const CI = !!process.env.CI;

test.test(`constructor`, { bail: !CI }, function (t) {
	let ray = new Ray();
	const { x, y, h, v } = ray;
	t.match([x, y, h, v], [0, 0, 1, 0]);
	const {
		heading,
		headingd,
		head: { x: vx, y: vy },
	} = ray;
	t.match([heading, headingd, vx, vy], [0, 0, 1, 0]);
	t.end();
});

test.test(`clone`, { bail: !CI }, function (t) {
	let ray = new Ray();
	let ray2 = ray.clone();
	t.ok(ray2);
	t.ok(ray2 instanceof Ray);
	t.not(ray, ray2);
	t.end();
});

test.test(`forward, back`, { bail: !CI }, function (t) {
	let ray = new Ray();

	{
		let { x, y, h, v } = ray.forward(3);
		t.match([x, y, h, v], [3, 0, 1, 0]);
	}
	// console.log(ray, ray.back)
	{
		let { x, y, h, v } = ray.back(4);
		t.match([x, y, h, v], [-1, 0, 1, 0]);
	}
	t.end();
});

test.test(`left`, { bail: !CI }, function (t) {
	let ray = new Ray();

	// 30°–60°–90° triangle
	let { x, y, h, v, heading, headingd } = ray
		.forward(1)
		.left((Math.PI * 2) / 3) // 120deg
		.forward(2)
		.left((Math.PI * 5) / 6); // 150deg

	t.almostEqual(x, 0, 1e-11);
	t.almostEqual(y, Math.sqrt(3), 1e-11);
	t.almostEqual(headingd, 270, 1e-11);
	t.almostEqual(heading, (Math.PI * 3) / 2, 1e-11);
	t.almostEqual(h, 0, 1e-11);
	t.almostEqual(v, -1, 1e-11);

	t.end();
});

test.test(`right`, { bail: !CI }, function (t) {
	let ray = new Ray();

	// 45°–45°–90° triangle
	let { x, y, h, v, heading, headingd } = ray
		.right()
		.forward(1)
		.right()
		.forward(1)
		.right(Math.PI * (1 / 2 + 1 / 4))
		.forward(Math.sqrt(2));

	t.almostEqual(x, 0, 1e-11);
	t.almostEqual(y, 0, 1e-11);
	t.almostEqual(headingd, 45, 1e-11);
	t.almostEqual(heading, Math.PI * (1 / 4), 1e-11);
	// t.almostEqual(h, 0, 1e-11);
	// t.almostEqual(v, -1, 1e-11);

	t.end();
});

test.test(`leftd`, { bail: !CI }, function (t) {
	let ray = new Ray();

	// 30°–60°–90° triangle
	ray.leftd(60).forward(2);

	t.almostEqual(ray.x, 1, 1e-11);
	t.almostEqual(ray.y, Math.sqrt(3), 1e-11);
	t.almostEqual(ray.heading, Math.PI / 3, 1e-11);

	ray.leftd(30).back(Math.sqrt(3));
	t.almostEqual(ray.x, 1, 1e-11);
	t.almostEqual(ray.y, 0, 1e-11);
	t.almostEqual(ray.headingd, 90, 1e-11);

	ray.leftd(90).forward(1);
	t.almostEqual(ray.x, 0, 1e-11);
	t.almostEqual(ray.y, 0, 1e-11);
	t.almostEqual(ray.headingd, 180, 1e-11);

	ray.leftd(180);
	t.almostEqual(ray.x, 0, 1e-11);
	t.almostEqual(ray.y, 0, 1e-11);
	t.almostEqual(ray.headingd % 360, 0, 1e-11);
	t.end();
});

test.test(`rightd`, { bail: !CI }, function (t) {
	let ray = new Ray();

	// 45°–45°–90° triangle
	ray.rightd(45).forward(Math.sqrt(2));

	t.almostEqual(ray.x, 1, 1e-11);
	t.almostEqual(ray.y, -1, 1e-11);
	t.almostEqual(ray.heading, Math.PI * 2 - Math.PI / 4, 1e-11);

	ray.rightd(180).back(Math.sqrt(2));
	t.almostEqual(ray.x, 2, 1e-11);
	t.almostEqual(ray.y, -2, 1e-11);

	ray.rightd(90).forward(Math.sqrt(2) * 2);
	t.almostEqual(ray.x, 4, 1e-11);
	t.almostEqual(ray.y, 0, 1e-11);
	t.end();
});

test.test(`delta`, { bail: !CI }, function (t) {
	let A = new Ray();
	let B = new Ray();

	t.same(A.delta(-3, 4).toArray(), [-3, 4]);
	// t.almostEqual(ray.distance(Point.at(-3, -4)), 5, 1e-11);
	// t.almostEqual(ray.distance(B.forward(-3).left().back(4)), 5, 1e-11);

	t.end();
});

test.test(`distance`, { bail: !CI }, function (t) {
	let ray = new Ray();
	let B = new Ray();

	t.almostEqual(ray.distance(8, 15), 17, 1e-11);
	t.almostEqual(ray.distance(Point.at(-3, -4)), 5, 1e-11);
	t.almostEqual(ray.distance(B.forward(-3).left().back(4)), 5, 1e-11);

	t.end();
});

test.test(`goto`, { bail: !CI }, function (t) {
	let A = new Ray();
	A.goto(1, Math.sqrt(3)).towards(0, 0);

	t.almostEqual(A.headingd, 180 + 60, 1e-11);

	// A.goto(10, 10).translate(-3, -4)

	t.end();
});

test.test(`towards`, { bail: !CI }, function (t) {
	let A = new Ray();
	A.towards(1, Math.sqrt(3));

	t.almostEqual(A.headingd, 60, 1e-11);

	t.end();
});

test.test(`away`, { bail: !CI }, function (t) {
	let A = new Ray();
	A.away(1, Math.sqrt(3));

	t.almostEqual(A.headingd, 180 + 60, 1e-11);

	t.end();
});

function* spiralOfTheodorus(opt) {
	const { atan, cos, sin, sqrt } = Math;
	if (typeof opt !== "object") {
		opt = { n: opt };
	}
	const { n: N, scale, rotate, transalteX, translateY } = opt;
	const sx = scale || 1;
	const sy = scale || 1;
	const tx = transalteX || 0;
	const ty = translateY || 0;
	const cosφ = rotate && cos(rotate);
	const sinφ = rotate && sin(rotate);

	const ONE = 1

	let φsum = 0;
	for (let n = 1; n < N; ++n) {
		const φ = atan(ONE / sqrt(n));
		let r;
		if (scale) {
			// x *= scale;
			// y *= scale;
			// r *= scale;r
			r = sqrt(n + ONE);
		} else {
			r = sqrt(n + ONE);
		}
		φsum += φ;
		let x = r * cos(φsum);
		let y = r * sin(φsum);

		// // rotate
		// const xp = cos_phi * x - sin_phi * y;
		// const yp = sin_phi * x + cos_phi * y;

		// // translate
		// curve[i + 0] = xp + cx;
		// curve[i + 1] = yp + cy;

		yield [n, r, x, y, φ, φsum];
	}
}

test.test(`Spiral of Theodorus`, { bail: !CI }, function (t) {
	const { PI } = Math;
	let A = new Ray();
	let B = new Ray();
	let O = Point.at(4, 4);
	for (const [n, r, x, y, φ, φsum] of spiralOfTheodorus({
		n: CI ? 444 : 13,
		scale: Math.E,
	})) {
		if (n === 1) {
			B.translate(x, y).left();
			O = Ray.new(x, y).left(φ).back(r).pos.clone();
		}
		const P = Point.at(x, y);
		console.log(n, r, x, y, (φ / PI) * 180, (φsum / PI) * 180);
		A.reset().left(φsum).forward(r);

		t.almostEqual(A.x, x, 1e-11);
		t.almostEqual(A.y, y, 1e-11);
		t.almostEqual(B.x, x, 1e-11);
		t.almostEqual(B.y, y, 1e-11);
		t.almostEqual(B.distance(O), r, 1e-11);

		B.left(φ).forward(1);

		t.ok(B.clone().back(1).pos.closeTo(P));
		t.almostEqual(B.distanceFromLine(O, P), 1, 1e-11);
		t.ok(B.clone().nearestPointOfLine(P, O).closeTo(P));
	}

	t.end();
});