'uses strict';
import {enum_path_data, test_segment} from './path.utils.js';
import './utils.js';
import {Line} from '../dist/path.js';
import test from 'tap';


for await (const item of enum_path_data({SEGMENTS: 'Line'})) {
	test.test(`<${item.d}>`, {bail: 1}, function (t) {
		let seg = new Line(item.start, item.end);
		test_segment(t, seg, item);
		t.end();
	});
}
