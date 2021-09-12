'uses strict';
import test from 'tap';
import {Path} from '../dist/index.js';
import {enum_path_data, test_segment} from './path.utils.js';
import './utils.js';
const CI = !!process.env.CI;

for await (const item of enum_path_data({SEGMENTS: ''})) {
	const {d} = item;
	switch (d) {
		case 'M0,0L10,0M0,0L10,0':
		case 'M0,0L10,0l10,0':
		case 'm0,0h10z':
		case 'm0,0h10Z':
			continue;
	}

	test.test(`<${d}>`, {bail: !CI}, function (t) {
		let seg = Path.fromPath(d);
		test_segment(t, seg, item, {len_epsilon:0.32,point_epsilon:0.0573,delta_epsilon:1e-7,slope_epsilon:0.0045});
		t.end();
	});
}
