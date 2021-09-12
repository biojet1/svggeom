'uses strict';
import {spawn} from 'child_process';
import {Box} from '../dist/box.js';
import test from 'tap';

export async function* enum_box_data(env) {
	const pyproc = spawn('python', ['test/data.box.py'], {
		stdio: ['ignore', 'pipe', 'inherit'],
		env: {...process.env, ...env},
	});
	let last;
	for await (const chunk of pyproc.stdout) {
		const lines = ((last ?? '') + chunk.toString()).split(/\r?\n/);
		last = lines.pop();
		for (const item of lines.map(value => JSON.parse(value))) {
			// console.log(item.points);
			yield item;
		}
	}
}

for await (const item of enum_box_data({})) {
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

	test.test(`Box(${x},${y},${width},${height})`, {bail: 1}, function (t) {
		let box = Box.fromRect(x, y, width, height);
		let box2 = Box.fromExtrema(xMin, xMax, yMin, yMax);
		const ex = [item, box];

		t.equal(box.x, x, 'x', ex);
		t.equal(box.y, y, 'y', ex);
		t.equal(box.width, width, 'width', ex);
		t.equal(box.height, height, 'height', ex);

		t.equal(box.left, left, 'left', ex);
		t.equal(box.rigth, rigth, 'rigth', ex);
		t.equal(box.top, top, 'top', ex);
		t.equal(box.bottom, bottom, 'bottom', ex);
		t.equal(box.centerX, centerX, 'centerX', ex);
		t.equal(box.centerY, centerY, 'centerY', ex);
		t.equal(box.xMin, xMin, 'xMin', ex);
		t.equal(box.yMin, yMin, 'yMin', ex);
		t.equal(box.xMax, xMax, 'xMax', ex);
		t.equal(box.yMax, yMax, 'yMax', ex);


		t.equal(box2.x, x, 'x', ex);
		t.equal(box2.y, y, 'y', ex);
		t.equal(box2.width, width, 'width', ex);
		t.equal(box2.height, height, 'height', ex);

		t.end();
	});
}