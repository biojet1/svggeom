'uses strict';
import {spawn} from 'child_process';
import {Box, Matrix, BoxMut} from '../dist/index.js';
import test from 'tap';
const CI = !!process.env.CI;

export async function* enum_box_data(env) {
	const pyproc = spawn('python', ['test/data.box.py'], {
		stdio: ['ignore', 'pipe', 'inherit'],
		env: {...process.env, ...env},
	});
	let last,
		i = 0;

	for await (const chunk of pyproc.stdout) {
		const lines = ((last ?? '') + chunk.toString()).split(/\r?\n/);
		last = lines.pop();

		for (const item of lines.map(value => JSON.parse(value))) {
			// console.log(item.points);
			yield [i++, item];
		}
	}
}

for await (const [i, item] of enum_box_data({})) {
	const {x, y, width, height, top, bottom, left, rigth, centerX, centerY, maxX, maxY, minX, minY} = item;

	test.test(`Box(${x},${y},${width},${height})`, {bail: !CI}, function (t) {
		let box2, box;
		switch (i % 3) {
			case 1:
				box = Box.new(x, y, width, height);
				box2 = Box.fromExtrema(minX, maxX, maxY, minY);
				break;
			case 2:
				box = Box.new(`${x}, ${y}, ${width}, ${height}`);
				box2 = Box.new(`${left} ${top} ${width} ${height}`);
				// box2 = Box.fromExtrema(maxX, minX, minY, maxY);
				break;
			default:
				box = Box.new(x, y, width, height);
				box2 = Box.fromExtrema(minX, maxX, minY, maxY);
		}
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
		t.equal(box.minX, minX, 'minX', ex);
		t.equal(box.minY, minY, 'minY', ex);
		t.equal(box.maxX, maxX, 'maxX', ex);
		t.equal(box.maxY, maxY, 'maxY', ex);

		t.equal(box2.x, x, 'x', ex);
		t.equal(box2.y, y, 'y', ex);
		t.equal(box2.width, width, 'width', ex);
		t.equal(box2.height, height, 'height', ex);
		t.ok(box2.isValid());
		t.ok(box.isValid());
		t.strictSame(box.clone().centerX, box2.centerX);
		t.strictSame(box2.clone().centerY, box.centerY);
		const box3 = box.transform(Matrix.parse('translate(100, -100)'));

		t.equal(box3.centerX, centerX + 100, 'centerX', box3);
		t.equal(box3.centerY, centerY - 100, 'centerY', box3);
		t.equal(box3.width, width, 'width', ex);
		t.equal(box3.height, height, 'height', ex);
		const not = Box.new();
		t.strictSame(not.merge(box2), box2);
		t.strictSame(not.merge(not), not);
		t.strictSame(box.merge(not), box);
		t.same(box2.toArray(), [x, y, width, height]);
		t.end();
	});
}

test.test(`Box extra`, {bail: !CI}, function (t) {
	const not = Box.not();
	t.notOk(not.isValid());
	t.strictSame(Box.new(), not);
	t.same(Box.empty().toArray(), [0, 0, 0, 0]);
	t.strictSame(not.transform(Matrix.parse('translate(100, -100)')), not);
	t.throws(() => Box.new(false), TypeError, 'wrong new params');

	// self.assertEqual(tuple(BoundingBox((0, 10), (0, 10)) +
	//                        BoundingBox((-10, 0), (-10, 0))), ((-10, 10), (-10, 10)))
	t.end();
});

const B = Box.new('-130,-90,130,90');
const D = Box.new('-60,-50,150,90');
const C = Box.new('-60 -50 60 50');
const A = Box.new('-210,-150,80,60');
const E = Box.new('-130,-90,0,0');
const F = Box.new('-130,-90,70,90');
const G = Box.new('-60,-90,60,40');
test.test(`Box overlap`, {bail: !CI}, function (t) {
	const bbox2 = Box.new([
		[2, 3],
		[1, 2],
	]);
	const bbox1 = Box.new([
		[0, 1],
		[2, 3],
	]);
	t.same(bbox1.overlap(bbox1).toArray(), bbox1.toArray());
	t.same(bbox2.overlap(bbox2).toArray(), bbox2.toArray());
	t.strictSame(bbox1.overlap(bbox2), Box.not());
	t.strictSame(bbox2.overlap(bbox1), Box.not());

	t.same(Box.not().overlap(bbox1).toArray(), bbox1.toArray());

	// const bbox1 = Box.new([-210, -150, 60, 3]);
	// Array.from(document.getElementsByTagName("rect")).sort().map(e=>`const ${e.id} = Box.new('${e.x.baseVal.value},${e.y.baseVal.value},${e.width.baseVal.value},${e.height.baseVal.value}');`).join('\n')
	t.same(B.overlap(D).toArray(), C.toArray());
	t.same(D.overlap(B).toArray(), C.toArray());
	t.same(A.overlap(B).toArray(), E.toArray());
	t.same(B.overlap(A).toArray(), E.toArray());
	t.strictSame(A.overlap(C), Box.not());
	t.strictSame(C.overlap(A), Box.not());
	t.end();
});

test.test(`Box merge`, {bail: !CI}, function (t) {
	t.same(C.merge(D).toArray(), D.toArray());
	t.same(D.merge(C).toArray(), D.toArray());
	t.same(B.overlap(C).merge(D).toArray(), D.toArray());
	t.same(E.merge(C).merge(F).toArray(), B.toArray());
	const not = Box.not();

	for (const b of [A, B, C, D, E, F]) {
		t.same(not.merge(b).toArray(), b.toArray());
		t.same(b.merge(not).toArray(), b.toArray());
	}
	let box = Box.not();

	for (const b of [C, G, F]) {
		box = box.merge(b);
	}
	t.same(box.toArray(), B.toArray());

	t.end();
});

test.test(`Box fromRect`, {bail: !CI}, function (t) {
	t.same(Box.fromRect({x:-20, width:400}).toArray(), [-20,0,400,0]);
	t.same(Box.fromRect({y:-20, height:400}).toArray(), [0,-20,0,400]);
	t.end();
});

test.test(`Box mutable`, {bail: !CI}, function (t) {
	const a = BoxMut.new([0, 0, 100, 100]);
	const b = BoxMut.parse('-60 -50 60 50');

	t.same(a.constructor.name, 'BoxMut');
	t.same(b.constructor.name, 'BoxMut');

	// // const b = new BoxRO(0, 0, 100, 100);

	a.x = 80;
	t.match(a.toString().split(/[,s]+/), ['80', '0', '100', '100']);
	a.y = -44;
	t.match(a.toString().split(/[,s]+/), ['80', '-44', '100', '100']);
	a.width = 20;
	t.match(a.toString().split(/[,s]+/), ['80', '-44', '20', '100']);
	a.height = 30;
	t.match(a.toString().split(/[,s]+/), ['80', '-44', '20', '30']);

	t.match(`${a.copy(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);
	t.notOk(BoxMut.new().isValid());
	// t.ok(BoxMut.new().equal(BoxMut.not()));
	t.match(`${BoxMut.not().copy(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);
	t.match(`${BoxMut.not().mergeSelf(b)}`.split(/[,s]+/), [-60, -50, 60, 50]);


	// const a = BoxMut.new([0, 0, 100, 100]);

	// t.throws(() => {
	// 	a.freeze().x = 60;
	// }, TypeError);
	// t.strictSame(a.x, 80);
	t.end();
});
