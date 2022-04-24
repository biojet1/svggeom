'uses strict';
import './utils.js';
import test from 'tap';
import { Matrix } from '../dist/matrix.js';

const CI = !!process.env.CI;

test.test(`Matrix.scale`, { bail: !CI }, function (t) {
	t.ok(Matrix.hexad(2, 0, 0, 2, 0, 0).equals(Matrix.scale(2)), 'x2 scale');
	t.ok(Matrix.hexad(-1, 0, 0, 1, 0, 0).equals(Matrix.scale(-1, 1)), 'hflip');
	t.ok(Matrix.hexad(1, 0, 0, -1, 0, 0).equals(Matrix.scale(1, -1)), 'vflip');
	t.ok(Matrix.parse('scale(2)').inverse().equals(Matrix.scale(0.5)), 'reverse_scale');
	t.end();
});

test.test(`Matrix.skew`, { bail: !CI }, function (t) {
	t.ok(Matrix.parse('skewX(1)').inverse().equals(Matrix.skewX(-1)), 'reverse_skewx');
	t.ok(Matrix.parse('skewY(-1)').inverse().equals(Matrix.skewY(1)), 'reverse_skewy');
	t.end();
});

test.test(`Matrix.rotate`, { bail: !CI }, function (t) {
	t.ok(Matrix.parse('rotate(30)').inverse().equals(Matrix.rotate(-30)), 'reverse_rotate');
	t.ok(Matrix.hexad(0, 1, -1, 0, 0, 0), Matrix.rotate(90));
	t.end();
});

test.test(`Matrix.identity`, { bail: !CI }, function (t) {
	t.ok(Matrix.hexad(1, 0, 0, 1, 0, 0).isIdentity);
	t.notOk(Matrix.hexad(1, 0, 0, 2, 0, 0).isIdentity);
	t.ok(Matrix.identity().equals(Matrix.parse('matrix(1 0 0 1 0 0)')), 'identity');
	t.ok(Matrix.parse('scale(1 1)').isIdentity);
	t.ok(Matrix.parse('rotate(0)').isIdentity);
	t.ok(Matrix.parse('translate(0 0)').isIdentity);
	t.ok(Matrix.identity().multiply(Matrix.hexad(1, 2, 3, 4, 5, 6)).equals(Matrix.parse('matrix(1 2 3 4 5 6)')));
	t.end();
});

test.test(`Matrix.preMultiply`, { bail: !CI }, function (t) {
	const m1 = Matrix.translate(-20, -20).multiply(Matrix.scale(2));
	const m2 = Matrix.parse('matrix(2, 0, 0, 2, -20, -20)');
	t.ok(m1.equals(m2), `preMultiply ${m1} ${m2}`);
	t.end();
});

test.test(`Matrix.translateYX`, { bail: !CI }, function (t) {
	const m1 = Matrix.translate(30, -40);
	const m2 = Matrix.translateY(-40).translateX(30);
	const m3 = Matrix.translateX(30).translateY(-40);
	t.ok(m2.equals(m1));
	t.ok(m3.equals(m1));
	t.ok(m2.equals(Matrix.parse('matrix(1 0 0 1 30 -40)')));
	t.end();
});

test.test(`Matrix.inverse`, { bail: !CI }, function (t) {
	const a = Matrix.parse('matrix(1 2 3 4 5 6)');
	const b = Matrix.parse('matrix(7 8 9 0 1 2)');
	const c = Matrix.parse('matrix(3 4 5 6 7 8)');
	const d = a.multiply(b).multiply(c);
	const e = c.multiply(b).multiply(a);
	t.ok(d.is2d);
	t.ok(d.inverse().inverse().equals(d, 1e-9), `.inverse().inverse() ${d} ${d.inverse().inverse()}`);
	t.ok(e.equals(e.inverse().inverse(), 1e-9), `.inverse().inverse() ${e} ${e.inverse().inverse()}`);
	t.ok(a.multiply(b.multiply(c)).equals(d), `assoc ${d} ${a.multiply(b.multiply(c))}`);
	t.ok(a.postMultiply(b).postMultiply(c).equals(e), `assoc ${e} ${a.postMultiply(b).postMultiply(c)}`);
	t.end();
});

