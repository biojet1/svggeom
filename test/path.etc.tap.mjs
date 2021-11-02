"uses strict";
import { spawn } from "child_process";
import { Path, Point } from "../dist/index.js";
import test from "tap";
const CI = !!process.env.CI;

test.test(`Path etc`, { bail: !CI }, function (t) {
	let p = Path.new(`m 100,45 h 125 v 80 h -125 z`);

	// console.log( Array.from, p)
	let segs = Array.from(p);

	t.same(segs[0].p1.toArray().slice(0, 2), [100, 45]);
	t.same(segs[0].p2.toArray().slice(0, 2), [225, 45]);

	t.same(segs[1].p1.toArray().slice(0, 2), [225, 45]);
	t.same(segs[1].p2.toArray().slice(0, 2), [225, 125]);

	t.same(segs[2].p1.toArray().slice(0, 2), [225, 125]);
	t.same(segs[2].p2.toArray().slice(0, 2), [100, 125]);

	t.same(segs[3].p1.toArray().slice(0, 2), [100, 125]);
	t.same(segs[3].p2.toArray().slice(0, 2), [100, 45]);

	t.ok(p.isContinuous());
	t.strictSame(segs.length, 4);

	p = Path.parse(`m 755.16947,151.67245 h 16.66665 V 66.487356 h -9.25925`);
	segs = Array.from(p);
	t.same(segs[0].p1.toArray().slice(0, 2), [755.16947, 151.67245]);
	t.same(segs[0].p2.toArray().slice(0, 2), [771.83612, 151.67245]);
	t.same(segs[1].p1.toArray().slice(0, 2), [771.83612, 151.67245]);
	t.same(segs[1].p2.toArray().slice(0, 2), [771.83612, 66.487356]);
	t.same(segs[2].p1.toArray().slice(0, 2), [771.83612, 66.487356]);

	t.ok(segs[2].p2.closeTo(Point.at(762.57684, 66.487356), 1e-4));
	t.same(p.firstPoint.toArray().slice(0, 2), [755.16947, 151.67245]);
	t.ok(p.lastPoint.closeTo(Point.at(762.57684, 66.487356), 1e-4));

	t.ok(p.isContinuous());
	t.strictSame(segs.length, 3);
	// t.same(segs[0].p2.toArray().slice(0, 2), [225, 45]);
	p = Path.parse(`m 0 0 h 200 v 300 h -200 Z`);
	t.ok(p.pointAtLength(300).closeTo(Point.at(200, 100), 1e-12));

	t.end();
});
