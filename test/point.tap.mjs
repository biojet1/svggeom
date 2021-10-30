"uses strict";
import { spawn } from "child_process";
import { Point } from "../dist/index.js";
import "./utils.js";

import test from "tap";
const CI = !!process.env.CI;

test.test(`point properties`, { bail: !CI }, function (t) {
	let p = Point.at(3, 4, 5);
	t.strictSame(p.x, 3);
	t.strictSame(p.y, 4);
	t.notOk(p.equals());
	t.notOk(p.equals(null));
	t.notOk(p.equals(undefined));
	t.ok(p.equals(p));
	t.ok(p.clone().equals(p));
	t.not(p.clone(), p);
	t.same(p.reflectAt(Point.at()).toArray(), [-3, -4], "reflectAt");
	t.end();
});

test.test(`point construct`, { bail: !CI }, function (t) {
	t.throws(() => Point.at(5, NaN), TypeError, "must be finite");
	t.same(Point.fromArray([42, 72]).toArray(), [42, 72], "fromArray");
	t.strictSame(Point.new().toPath(), "M 0 0", "Point.new()");
	t.strictSame(Point.new(-1).toString(), "Point(-1, 0)", "Point.new(number)");
	t.strictSame(Point.new([42, 72]).toPath(), "M 42 72", "Point.new(array)");



	t.throws(() => Point.new(NaN), TypeError, "must be finite");
	t.end();
});

test.test(`point extra`, { bail: !CI }, function (t) {
	t.throws(
		() => Point.at(0, 0).normalize(),
		TypeError,
		"normalize vector of zero length"
	);
	t.same(
		Point.at(5, 7).normalize(),
		Point.at(0.5812381937190965, 0.813733471206735)
	);
	if (Point.at(8, 6).normal().x < 0) {
		t.same(Point.at(8, 6).normal(), Point.at(-6, 8));
	} else {
		t.same(Point.at(8, 6).normal(), Point.at(6, -8));
	}
	let A = Point.fromPolar(4, (337.11417665550067 / 180) * Math.PI);

	t.almostEqual(A.x, 3.6851266321570497, 1e-11);
	t.almostEqual(A.y, -1.5555840398277552, 1e-11);

	const { PI, E, LN10, LOG2E } = Math;
	t.almostEqual(
		(Point.at(0, 0).angleTo(Point.at(3, 4)) * 180) / PI,
		53.13010235415598,
		1e-11
	);
	t.almostEqual((Point.at(42, 42).angle * 180) / PI, 45, 1e-11);
	const r = Point.at(-2.1830320757712625, -2.057758721559409).angleTo(
		Point.at(0, 0)
	);
	console.log(r);
	t.almostEqual((r / PI) * 180, 90 - (270 - 223.30796939966595), 1e-11);
	t.almostEqual(Point.grade(33.33333333333333333).angle, (30/180)*PI, 1e-11);

	t.end();
});

test.test(`pentagon extra`, { bail: !CI }, function (t) {
	const { PI, E, LN10, LOG2E, sqrt } = Math;
	function degrees(r) {
		const d = (r / PI) * 180;
		return ((d % 360) + 360) % 360;
	}
	// https://mathworld.wolfram.com/RegularPentagon.html
	const c1 = (sqrt(5) - 1) / 4;
	const c2 = (sqrt(5) + 1) / 4;
	const s1 = sqrt(10 + 2 * sqrt(5)) / 4;
	const s2 = sqrt(10 - 2 * sqrt(5)) / 4;
	t.almostEqual(
		degrees(Point.at(s1, c1).angleTo(Point.at(s2, -c2))),
		72 + 180,
		1e-11
	);
	t.almostEqual(
		degrees(Point.at(-s2, -c2).angleTo(Point.at(0, 1))),
		72,
		1e-11
	);
	t.almostEqual(
		degrees(Point.at(-s2, -c2).angleTo(Point.at(s2, -c2))),
		0,
		1e-11
	);
	t.end();
});
