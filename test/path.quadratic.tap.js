'uses strict';
import {enum_path_data, test_segment} from './path.utils.js';
import './utils.js';
import {Quadratic} from '../dist/index.js';
import test from 'tap';


for await (const item of enum_path_data({SEGMENTS: 'QuadraticBezier'})) {
	test.test(item.d, {bail: 1}, function (t) {
		let seg = new Quadratic(...item.points)
		test_segment(t, seg, item, {len_epsilon:0.05});
		t.end();
	});
}
