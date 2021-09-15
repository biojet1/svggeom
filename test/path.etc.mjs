"uses strict";
import { spawn } from "child_process";
import { Path, Point } from "../dist/index.js";
import test from "tap";
const CI = !!process.env.CI;

test.test(`Path etc`, { bail: !CI }, function (t) {
	let p = Path.from(`m 100,45 h 125 v 80 h -125 z`);
	let segs = p.segments();

	t.same(segs[0].p1.toArray(), [100, 45]);
	t.same(segs[0].p2.toArray(), [225, 45]);

	t.same(segs[1].p1.toArray(), [225, 45]);
	t.same(segs[1].p2.toArray(), [225, 125]);

	t.same(segs[2].p1.toArray(), [225, 125]);
	t.same(segs[2].p2.toArray(), [100, 125]);

	t.same(segs[3].p1.toArray(), [100, 125]);
	t.same(segs[3].p2.toArray(), [100, 45]);

	t.strictSame(segs.length, 4);

	p = Path.from(`m 755.16947,151.67245 h 16.66665 V 66.487356 h -9.25925`);
	segs = p.segments();
	t.same(segs[0].p1.toArray(), [755.16947, 151.67245]);
	t.same(segs[0].p2.toArray(), [771.83612, 151.67245]);
	t.same(segs[1].p1.toArray(), [771.83612, 151.67245]);
	t.same(segs[1].p2.toArray(), [771.83612, 66.487356]);
	t.same(segs[2].p1.toArray(), [771.83612, 66.487356]);
	t.ok(segs[2].p2.closeTo(Point.at(762.57684, 66.487356), 1e-4));
	t.strictSame(segs.length, 3);
	// t.same(segs[0].p2.toArray(), [225, 45]);

	t.end();
});
