'uses strict';
import { enum_path_data, test_segment } from './path.utils.js';
import './utils.js';
import { PathLS, SegmentLS, Quadratic } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;

for await (const item of enum_path_data({ SEGMENTS: 'QuadraticBezier' })) {
    test.test(item.d, { bail: !CI }, function (t) {
        let seg = new Quadratic(...item.points);
        test_segment(t, seg, item, { len_epsilon: 0.05 });
        // let seg = SegmentLS.moveTo(200, 300).quadraticCurveTo(400, 50, 600, 300);
        console.log(item.length);
        t.end();
    });
}
test.test('Testing Quadratic Bézier', { bail: !CI }, function (t) {
    let seg = SegmentLS.moveTo(200, 300).quadraticCurveTo(400, 50, 600, 300);
    console.dir(seg);
    t.almostEqual(seg.length, 487.77, 0.01);
    t.end();
    //         let properties = new SVGPathProperties("M200,300 Q400,50 600,300");
    // test.true(inDelta(properties.getTotalLength(), 487.77, 0.1));
});
