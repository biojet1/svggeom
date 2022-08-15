'uses strict';
import { enum_path_data, test_segment, testSegment } from './path.utils.js';
import './utils.js';
import { PathLS, SegmentLS, Quadratic } from 'svggeom';
import test from 'tap';
const CI = !!process.env.CI;
const deltp = { len_epsilon: 0.05 };

for await (const item of enum_path_data({ SEGMENTS: 'QuadraticBezier' })) {
    test.test(item.d, { bail: !CI }, function (t) {
        let seg = new Quadratic(...item.points);
        test_segment(t, seg, item, deltp);
        // let seg = SegmentLS.moveTo(200, 300).quadraticCurveTo(400, 50, 600, 300);
        console.log(item.length);
        t.end();
    });
    test.test(`PathLS<${item.d}>`, { bail: CI }, function (t) {
        const [start, p, end] = item.points;
        const [[sx, sy], [x1, y1], [ex, ey]] = [start, p, end];
        {
            const cur = PathLS.moveTo(start).quadraticCurveTo(p, end);
            testSegment(t, cur, item, deltp);
            const cur2 = PathLS.moveTo(sx, sy).quadraticCurveTo(x1, y1, ex, ey);
            t.same(cur.toString(), cur2.toString());
        }
        if (CI) {
            testSegment(
                t,
                PathLS.parse(`M ${sx},${sy} Q ${x1},${y1} ${x2},${y2} ${ex},${ey}`),
                item,
                deltp,
            );
            testSegment(
                t,
                PathLS.parse(
                    `m ${sx},${sy} c ${x1 - sx},${y1 - sy} ${x2 - sx},${y2 - sy} ${ex - sx},${ey - sy}`,
                ),
                item,
                deltp,
            );
        }
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
