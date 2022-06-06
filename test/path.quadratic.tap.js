'uses strict';
import {enum_path_data, test_segment} from './path.utils.js';
import './utils.js';
import {Quadratic} from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;

for await (const item of enum_path_data({SEGMENTS: 'QuadraticBezier'})) {
    test.test(item.d, {bail: !CI}, function (t) {
        let seg = new Quadratic(...item.points);
        test_segment(t, seg, item, {len_epsilon: 0.05});
        t.end();
    });
}
