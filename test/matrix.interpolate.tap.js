'uses strict';
import './utils.js';
import test from 'tap';
import {MatrixInterpolate, Path} from '../dist/index.js';

const CI = !!process.env.CI;

test.test(`Seq`, {bail: !CI}, function (t) {
	const {seq, rotate, translate} = MatrixInterpolate
	const s = seq(rotate(90), translate(10, 20));
	// Path.parse('M 10 0 H ')
	console.log(s.at(0.3));
	// const m2 = Matrix.translateY(-40).translateX(30);
	// const m3 = Matrix.translateX(30).translateY(-40);
	// t.ok(m2.equals(m1));
	// t.ok(m3.equals(m1));
	// t.ok(m2.equals(Matrix.parse('matrix(1 0 0 1 30 -40)')));
	t.end();
});
