"uses strict";
import { spawn } from "child_process";
import { Box, Matrix } from "../dist/index.js";
import test from "tap";
const CI = !!process.env.CI;

export async function* enum_box_data(env) {
	const pyproc = spawn("python", ["test/data.box.py"], {
		stdio: ["ignore", "pipe", "inherit"],
		env: { ...process.env, ...env },
	});
	let last,
		i = 0;

	for await (const chunk of pyproc.stdout) {
		const lines = ((last ?? "") + chunk.toString()).split(/\r?\n/);
		last = lines.pop();

		for (const item of lines.map((value) => JSON.parse(value))) {
			// console.log(item.points);
			yield [i++, item];
		}
	}
}

for await (const [i, item] of enum_box_data({})) {
	const {
		x,
		y,
		width,
		height,
		top,
		bottom,
		left,
		rigth,
		centerX,
		centerY,
		xMax,
		yMax,
		xMin,
		yMin,
	} = item;

	test.test(`Box(${x},${y},${width},${height})`, { bail: !CI }, function (t) {
		let box2, box;
		switch (i % 3) {
			case 1:
				box = Box.fromRect(x, y, width, height);
				box2 = Box.fromExtrema(xMin, xMax, yMax, yMin);
				break;
			case 2:
				box = Box.new(`${x}, ${y}, ${width}, ${height}`);
				box2 = Box.fromExtrema(xMax, xMin, yMin, yMax);
				break;
			default:
				box = Box.new(x, y, width, height);
				box2 = Box.fromExtrema(xMin, xMax, yMin, yMax);
		}
		const ex = [item, box];

		t.equal(box.x, x, "x", ex);
		t.equal(box.y, y, "y", ex);
		t.equal(box.width, width, "width", ex);
		t.equal(box.height, height, "height", ex);

		t.equal(box.left, left, "left", ex);
		t.equal(box.rigth, rigth, "rigth", ex);
		t.equal(box.top, top, "top", ex);
		t.equal(box.bottom, bottom, "bottom", ex);
		t.equal(box.centerX, centerX, "centerX", ex);
		t.equal(box.centerY, centerY, "centerY", ex);
		t.equal(box.xMin, xMin, "xMin", ex);
		t.equal(box.yMin, yMin, "yMin", ex);
		t.equal(box.xMax, xMax, "xMax", ex);
		t.equal(box.yMax, yMax, "yMax", ex);

		t.equal(box2.x, x, "x", ex);
		t.equal(box2.y, y, "y", ex);
		t.equal(box2.width, width, "width", ex);
		t.equal(box2.height, height, "height", ex);
		t.ok(box2.isValid());
		t.ok(box.isValid());
		t.strictSame(box.clone().centerX, box2.centerX);
		t.strictSame(box2.clone().centerY, box.centerY);
		const box3 = box.transform(Matrix.parse("translate(100, -100)"));

		t.equal(box3.centerX, centerX + 100, "centerX", box3);
		t.equal(box3.centerY, centerY - 100, "centerY", box3);
		t.equal(box3.width, width, "width", ex);
		t.equal(box3.height, height, "height", ex);
		const not = Box.new();
		t.strictSame(not.merge(box2), box2);
		t.strictSame(not.merge(not), not);
		t.strictSame(box.merge(not), box);
		t.end();
	});
}

test.test(`Box extra`, { bail: !CI }, function (t) {
	const not = Box.not();
	t.notOk(not.isValid());
	t.strictSame(Box.new(), not);
	t.strictSame(not.transform(Matrix.parse("translate(100, -100)")), not);
	t.throws(() => Box.new(false), TypeError, "wrong new params");

	// self.assertEqual(tuple(BoundingBox((0, 10), (0, 10)) +
	//                        BoundingBox((-10, 0), (-10, 0))), ((-10, 10), (-10, 10)))
	t.end();
});
