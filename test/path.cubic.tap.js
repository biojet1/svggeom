'uses strict';
import { enum_path_data, test_segment, testSegment } from './path.utils.js';
import './utils.js';
import { PathLC as PathChain } from 'svggeom';
import test from 'tap';
const { Unit: PathUnit } = PathChain
const CI = !!process.env.CI;

const deltp = { len_epsilon: 0.189, point_epsilon: 1e-10, slope_epsilon: 1e-8 };

for await (const item of enum_path_data({ SEGMENTS: 'CubicBezier' })) {
    test.test(`PathUnit<${item.d}>`, { bail: CI }, function (t) {
        const [start, c1, c2, end] = item.points;
        const [[sx, sy], [x1, y1], [x2, y2], [ex, ey]] = [start, c1, c2, end];
        {
            // const cur = PathUnit.move_to(start).bezierCurveTo(c1, c2, end);
            // testSegment(t, cur, item, deltp);
            // const cur2 = PathUnit.move_to([sx, sy]).bezierCurveTo(x1, y1, x2, y2, ex, ey);
            // t.same(cur.toString(), cur2.toString());
        }
        // if (CI)
        {
            testSegment(t, PathUnit.parse(`M ${sx},${sy} C ${x1},${y1} ${x2},${y2} ${ex},${ey}`), item, deltp);
            testSegment(
                t,
                PathUnit.parse(`m ${sx},${sy} c ${x1 - sx},${y1 - sy} ${x2 - sx},${y2 - sy} ${ex - sx},${ey - sy}`),
                item,
                deltp
            );
        }
        t.end();
    });
}
