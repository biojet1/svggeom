'uses strict';
import {enum_path_data, test_segment} from './path.utils.js';
import './utils.js';
import {Cubic} from '../dist/index.js';
import test from 'tap';


for await (const item of enum_path_data({SEGMENTS: 'CubicBezier'})) {
	test.test(`<${item.d}>`, {bail: 1}, function (t) {
		let seg = new Cubic(...item.points);
		test_segment(t, seg, item, {len_epsilon:0.189, point_epsilon:1e-10, slope_epsilon:1e-8});
		t.end();
	});
}
