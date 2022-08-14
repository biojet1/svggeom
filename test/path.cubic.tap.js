'uses strict';
import { enum_path_data, test_segment } from './path.utils.js';
import './utils.js';
import { Cubic, PathLS } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;

for await (const item of enum_path_data({ SEGMENTS: 'CubicBezier' })) {
    test.test(`<${item.d}>`, { bail: !CI }, function (t) {
        let seg = new Cubic(...item.points);
        test_segment(t, seg, item, { len_epsilon: 0.189, point_epsilon: 1e-10, slope_epsilon: 1e-8 });

        const [s, a, b, e] = item.points;
        seg = PathLS.moveTo(...s).bezierCurveTo(a, b, e);
        // test_segment(t, seg, item, { len_epsilon: 0.189, point_epsilon: 1e-10, slope_epsilon: 1e-8 });
        // console.dir(seg, {depth: null});
        // console.log(s, a, b, e, seg.d());

        t.end();
    });
}
