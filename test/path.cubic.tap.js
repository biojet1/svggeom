'uses strict';
import { enum_path_data, test_segment, testSegment } from './path.utils.js';
import './utils.js';
import { Cubic, PathLS } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;

const deltp = { len_epsilon: 0.189, point_epsilon: 1e-10, slope_epsilon: 1e-8 }

for await (const item of enum_path_data({ SEGMENTS: 'CubicBezier' })) {
    const [start, c1, c2, end] = item.points;
    const cur = PathLS.moveTo(start).bezierCurveTo(c1, c2, end);
    test.test(`<${item.d}>`, { bail: CI }, function (t) {
        testSegment(t, cur, item, deltp);
        t.end();
    });
}

for await (const item of enum_path_data({ SEGMENTS: 'CubicBezier' })) {
    test.test(`<${item.d}>`, { bail: !CI }, function (t) {
        let seg = new Cubic(...item.points);
        test_segment(t, seg, item, deltp);

        // const [s, a, b, e] = item.points;
        // seg = PathLS.moveTo(...s).bezierCurveTo(a, b, e);
        // // test_segment(t, seg, item, { len_epsilon: 0.189, point_epsilon: 1e-10, slope_epsilon: 1e-8 });
        // // console.dir(seg, {depth: null});
        // // console.log(s, a, b, e, seg.d());
        testSegment(t, seg, item, deltp);
        t.end();
    });
}
