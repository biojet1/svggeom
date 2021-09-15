"uses strict";
import { spawn } from "child_process";
import { Point } from "../dist/index.js";
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
	t.strictSame(Point.from().toPath(), "M 0 0", "Point.from()");
	t.strictSame(
		Point.from(-1).toString(),
		"Point(-1, 0)",
		"Point.from(number)"
	);
	t.strictSame(Point.from([42, 72]).toPath(), "M 42 72", "Point.from(array)");
	t.throws(() => Point.from(NaN), TypeError, "must be finite");
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
	t.end();
});
